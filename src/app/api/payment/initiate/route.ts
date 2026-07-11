import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getConfig, buildInitiateBody, parsePaynowResponse } from '@/lib/paynow'

const initiateSchema = z.object({
  quoteId: z.string().min(1),
  paymentMethod: z.enum(['ecocash', 'innbucks', 'telecash', 'bank_transfer', 'card']),
  amount: z.number().positive(),
  customer: z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(5),
    name: z.string().min(1),
  }),
})

async function savePaymentRecord(
  supabase: ReturnType<typeof createClient>,
  quoteId: string,
  amount: number,
  paymentMethod: string,
  reference: string,
) {
  try {
    await supabase.from('payments').insert({
      quote_id: quoteId,
      amount_usd: amount,
      method: paymentMethod,
      paynow_reference: reference,
      status: 'pending',
    })
  } catch {
    // Non-critical — the payment flow continues regardless.
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = initiateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const { quoteId, paymentMethod, amount, customer } = parsed.data
    const reference = `FRP-${quoteId}-${Date.now().toString().slice(-6)}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const config = getConfig()

    if (config) {
      const paynowBody = buildInitiateBody({
        id: config.id,
        reference,
        amount: amount.toFixed(2),
        additionalInfo: `Freerock Solar — ${customer.name} (${paymentMethod})`,
        returnUrl: `${siteUrl}/solar/payment/confirmation?quoteId=${quoteId}&method=${paymentMethod}`,
        resultUrl: `${siteUrl}/api/payment/verify`,
        authEmail: config.authEmail,
        key: config.key,
      })

      const paynowRes = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: paynowBody.toString(),
        signal: AbortSignal.timeout(15000),
      })

      const text = await paynowRes.text()
      const res = parsePaynowResponse(text)

      if (res.status === 'Ok') {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const cookieStore = await cookies()
          const supabase = createClient(cookieStore)
          await savePaymentRecord(supabase, quoteId, amount, paymentMethod, reference)
        }

        return NextResponse.json({
          payment_url: res.browserurl,
          poll_url: res.pollurl,
          reference,
          amount,
          paymentMethod,
        }, { status: 201 })
      }

      return NextResponse.json({ error: res.error || 'Paynow gateway rejected the request' }, { status: 502 })
    }

    // No Paynow credentials configured (dev/demo environment).
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      await savePaymentRecord(supabase, quoteId, amount, paymentMethod, reference)
    }

    return NextResponse.json({
      payment_url: null,
      simulated: true,
      reference,
      amount,
      paymentMethod,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

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

async function savePaymentRecord(supabase: ReturnType<typeof createClient>, quoteId: string, amount: number, paymentMethod: string, reference: string) {
  try {
    await supabase.from('payments').insert({
      quote_id: quoteId,
      amount_usd: amount,
      method: paymentMethod,
      paynow_reference: reference,
      status: 'pending',
    })
  } catch {
    // Non-critical; payment flow continues
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

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    const paynowId = process.env.PAYNOW_MERCHANT_ID
    const paynowKey = process.env.PAYNOW_MERCHANT_KEY

    if (paynowId && paynowKey) {
      const fields = new URLSearchParams({
        id: paynowId,
        reference,
        amount: amount.toFixed(2),
        currency: 'USD',
        returnurl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/solar/payment/confirmation?quoteId=${quoteId}`,
        resulturl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/verify`,
        status: 'Message',
        additional1: customer.name,
        additional2: customer.phone,
        additional3: quoteId,
        additional4: paymentMethod,
        e: customer.email || 'customer@freerock.co.zw',
      })

      const auth = Buffer.from(`${paynowId}:${paynowKey}`).toString('base64')
      const paynowRes = await fetch('https://www.paynow.co.zw/interface/link/paynow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: fields.toString(),
      })

      const text = await paynowRes.text()
      const params = new URLSearchParams(text)

      if (params.get('status') === 'Ok') {
        if (isSupabaseConfigured) {
          const cookieStore = await cookies()
          const supabase = createClient(cookieStore)
          await savePaymentRecord(supabase, quoteId, amount, paymentMethod, reference)
        }

        return NextResponse.json({
          payment_url: params.get('browserurl'),
          poll_url: params.get('pollurl'),
          reference,
          amount,
          paymentMethod,
        }, { status: 201 })
      }

      return NextResponse.json({ error: 'Paynow error: ' + params.get('error') }, { status: 502 })
    }

    // Fallback: mock redirect
    if (isSupabaseConfigured) {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      await savePaymentRecord(supabase, quoteId, amount, paymentMethod, reference)
    }

    return NextResponse.json({
      payment_url: `https://www.paynow.co.zw/interface/link/paynow?reference=${reference}`,
      reference,
      amount,
      paymentMethod,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getConfig, verifyPayloadHash, pollTransaction, queryTransaction } from '@/lib/paynow'

function ok(): NextResponse {
  return new NextResponse('OK', { status: 200 })
}

function fail(): NextResponse {
  return new NextResponse('FAIL', { status: 200 })
}

/** POST /api/payment/verify — Paynow ITN (Instant Transaction Notification)
 *  webhook. Called by Paynow after a payment attempt completes. We verify the
 *  SHA512 hash to prove the notification is genuine, then update the payment
 *  and quote records in Supabase.
 *
 *  Paynow sends `application/x-www-form-urlencoded` fields:
 *    reference, paynowreference, amount, status, pollurl, hash */
export async function POST(request: Request) {
  const config = getConfig()

  // Parse the raw body as text (not formData — URLSearchParams handles it).
  const raw = await request.text()
  const payload = Object.fromEntries(new URLSearchParams(raw))

  // Hash verification: if Paynow credentials are configured, reject any
  // payload whose hash does not match. Without credentials we cannot verify
  // but still acknowledge (dev mode).
  if (config && !verifyPayloadHash(payload, config.key)) {
    return new NextResponse('Invalid signature', { status: 403 })
  }

  const status = (payload.status ?? '').toLowerCase()
  const reference = payload.reference ?? ''
  const paynowReference = payload.paynowreference ?? ''
  const amount = payload.amount ?? '0'

  if (status === 'paid') {
    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        // Update the payments record.
        await supabase.from('payments')
          .update({ status: 'completed', paynow_reference: paynowReference, transaction_ref: reference })
          .eq('paynow_reference', reference)

        // The reference is "FRP-{quoteId}-{suffix}". Extract the quoteId.
        const parts = reference.replace('FRP-', '').split('-')
        if (parts.length >= 1) {
          const quoteId = parts.slice(0, -1).join('-') // everything before the last segment
          await supabase.from('quotes')
            .update({ payment_status: 'deposit_paid', payment_method: 'card' })
            .eq('quote_id', quoteId)
        }
      } catch {
        // Non-critical — Paynow still got the OK and the customer sees success.
      }
    }

    return ok()
  }

  return fail()
}

/** GET /api/payment/verify — Poll Paynow for transaction status.
 *  Supports two modes:
 *  1. `?pollurl=<url>` — Use the poll URL returned by the initiation call
 *     (preferred — no auth needed).
 *  2. `?reference=<ref>` — Query Paynow directly using merchant credentials. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const pollUrl = url.searchParams.get('pollurl')
  const reference = url.searchParams.get('reference')

  if (pollUrl) {
    const result = await pollTransaction(pollUrl)
    if (result) {
      return NextResponse.json({
        status: result.status ?? 'unknown',
        paynowReference: result.paynowreference ?? '',
        amount: result.amount ?? '0',
      })
    }
  }

  if (reference) {
    const result = await queryTransaction(reference)
    if (result) {
      return NextResponse.json({
        status: result.status ?? 'unknown',
        paynowReference: result.paynowreference ?? '',
        amount: result.amount ?? '0',
      })
    }
  }

  return NextResponse.json({ status: 'unknown' })
}

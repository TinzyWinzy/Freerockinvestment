import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())

  // Paynow sends: reference, paynowreference, amount, status, pollurl, hash
  const status = data.status as string
  const reference = data.reference as string
  const paynowReference = data.paynowreference as string

  if (status === 'Paid') {
    // TODO: Update quote in Supabase
    // const supabase = createBrowserClient(...)
    // await supabase.from('payments').insert({ quote_id, reference: paynowReference, amount, method, status: 'completed' })
    // await supabase.from('quotes').update({ payment_status: 'deposit_paid' }).eq('quote_id', reference.split('-')[1])
    return new NextResponse('OK', { status: 200 })
  }

  // Payment failed or cancelled
  return new NextResponse('FAIL', { status: 200 })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const reference = url.searchParams.get('reference')

  // Poll Paynow for status
  const paynowId = process.env.PAYNOW_MERCHANT_ID
  const paynowKey = process.env.PAYNOW_MERCHANT_KEY

  if (paynowId && paynowKey && reference) {
    const auth = Buffer.from(`${paynowId}:${paynowKey}`).toString('base64')
    const res = await fetch('https://www.paynow.co.zw/interface/query/paynow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: new URLSearchParams({ id: paynowId, reference }).toString(),
    })

    const text = await res.text()
    const params = new URLSearchParams(text)
    return NextResponse.json({
      status: params.get('status'),
      paynowReference: params.get('paynowreference'),
      amount: params.get('amount'),
    })
  }

  return NextResponse.json({ status: 'unknown' })
}

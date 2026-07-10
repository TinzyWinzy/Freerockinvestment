import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Vercel Cron: Fetch RBZ exchange rate daily at 06:00 CAT
// Add to vercel.json: { "crons": [{ "path": "/api/cron/rate", "schedule": "0 4 * * *" }] }

export async function GET() {
  try {
    // Try to fetch from RBZ or a reliable aggregator
    const res = await fetch('https://api.example.com/rates/usd-zig', {
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    const rate = data.rate || 350

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    await supabase.from('exchange_rates').insert({
      rate,
      source: 'cron',
    })

    return NextResponse.json({ rate, source: 'cron', timestamp: new Date().toISOString() })
  } catch {
    // If fetch fails, don't error — cron will retry next day
    return NextResponse.json({ error: 'Rate fetch failed' }, { status: 502 })
  }
}

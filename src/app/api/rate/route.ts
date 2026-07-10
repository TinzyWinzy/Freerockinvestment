import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      const { data } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        return NextResponse.json({
          pair: 'USD/ZIG',
          rate: data.rate,
          source: data.source,
          lastUpdated: data.created_at,
        })
      }
    } catch {
      // Fall through to mock
    }
  }

  const rate = {
    pair: 'USD/ZIG',
    rate: 350,
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(rate)
}

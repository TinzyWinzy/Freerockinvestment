import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getUpcomingIntakes() {
  const now = new Date()
  const intakes = []
  for (let i = 0; i < 4; i++) {
    const start = new Date(now)
    start.setDate(start.getDate() + (i * 30) + 14)
    const end = new Date(start)
    end.setDate(end.getDate() + 13)
    intakes.push({
      id: `intake-${i + 1}`,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      duration: '2 weeks',
      location: '123 Chinhoyi Mall, Office 12, First Floor',
      priceUSD: 300,
      spotsAvailable: 10 + (i * 2),
    })
  }
  return intakes
}

export async function GET() {
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      const { data } = await supabase
        .from('training_intakes')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date')

      if (data) return NextResponse.json({ intakes: data })
    } catch {
      // Fall through to mock
    }
  }

  const intakes = getUpcomingIntakes()

  return NextResponse.json({ intakes })
}

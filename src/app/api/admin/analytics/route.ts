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

      const { count: totalQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })

      const { count: depositPaid } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'deposit_paid')

      const { count: fullyPaid } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'fully_paid')

      const analytics = {
        summary: {
          totalQuotes: totalQuotes ?? 0,
          depositPaid: depositPaid ?? 0,
          fullyPaid: fullyPaid ?? 0,
        },
      }

      return NextResponse.json(analytics)
    } catch {
      // Fall through to mock
    }
  }

  const analytics = {
    quotesOverTime: [
      { month: '2026-01', count: 12, totalValue: 21600 },
      { month: '2026-02', count: 18, totalValue: 34200 },
      { month: '2026-03', count: 15, totalValue: 28500 },
      { month: '2026-04', count: 22, totalValue: 41800 },
      { month: '2026-05', count: 28, totalValue: 53200 },
      { month: '2026-06', count: 31, totalValue: 62000 },
    ],
    revenueByService: [
      { serviceId: '3.2kva', count: 15, revenue: 27000 },
      { serviceId: '5.5kva', count: 42, revenue: 134400 },
      { serviceId: '8kva', count: 18, revenue: 86400 },
      { serviceId: '10kva', count: 8, revenue: 49600 },
      { serviceId: '12kva', count: 5, revenue: 39000 },
    ],
    leadSources: [
      { source: 'website', count: 120 },
      { source: 'youtube', count: 85 },
      { source: 'instagram', count: 45 },
      { source: 'referral', count: 30 },
      { source: 'tiktok', count: 20 },
    ],
    summary: {
      totalQuotes: 126,
      totalRevenue: 336400,
      conversionRate: 0.42,
      averageQuoteValue: 2670,
    },
  }

  return NextResponse.json(analytics)
}

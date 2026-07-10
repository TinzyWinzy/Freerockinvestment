import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const MOCK_LEADS = [
  { id: 'lead-001', fullName: 'Tendai Moyo', email: 'tendai@example.com', phone: '+263 77 111 2222', province: 'Harare', serviceId: '5.5kva', status: 'new', createdAt: '2026-07-08T10:30:00Z', source: 'website' },
  { id: 'lead-002', fullName: 'Sarah Ndlovu', email: 'sarah@example.com', phone: '+263 71 333 4444', province: 'Bulawayo', serviceId: '3.2kva', status: 'contacted', createdAt: '2026-07-07T14:00:00Z', source: 'youtube' },
  { id: 'lead-003', fullName: 'Chenai Gumbo', email: 'chenai@example.com', phone: '+263 78 555 6666', province: 'Manicaland', serviceId: '8kva', status: 'quoted', createdAt: '2026-07-06T09:15:00Z', source: 'referral' },
  { id: 'lead-004', fullName: 'Brian Chikwanha', email: 'brian@example.com', phone: '+263 77 777 8888', province: 'Mashonaland East', serviceId: '10kva', status: 'deposit_paid', createdAt: '2026-07-05T16:45:00Z', source: 'instagram' },
  { id: 'lead-005', fullName: 'Rumbidzai Sithole', email: 'rumbi@example.com', phone: '+263 71 999 0000', province: 'Harare', serviceId: '5.5kva', status: 'new', createdAt: '2026-07-04T11:00:00Z', source: 'website' },
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      let query = supabase.from('quotes').select('*, customers(*)')

      if (status) query = query.eq('quote_status', status)
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)

      const { data } = await query.order('created_at', { ascending: false })

      return NextResponse.json({ leads: data ?? [], total: data?.length ?? 0 })
    } catch {
      // Fall through to mock
    }
  }

  let filtered = [...MOCK_LEADS]

  if (status) {
    filtered = filtered.filter((l) => l.status === status)
  }

  if (from) {
    const fromDate = new Date(from)
    filtered = filtered.filter((l) => new Date(l.createdAt) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    filtered = filtered.filter((l) => new Date(l.createdAt) <= toDate)
  }

  return NextResponse.json({ leads: filtered, total: filtered.length })
}

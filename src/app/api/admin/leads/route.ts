import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { SOLAR_PACKAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export type DepositStatus = 'deposit_paid' | 'pending' | 'cancelled' | 'completed'

export interface Lead {
  quoteId: string
  name: string
  phone: string
  email: string
  service: string
  tier: string
  location: string
  depositStatus: DepositStatus
  date: string
  totalUsd: number
  depositUsd: number
  source: string
}

function toDepositStatus(quoteStatus?: string, paymentStatus?: string): DepositStatus {
  if (quoteStatus === 'cancelled') return 'cancelled'
  if (quoteStatus === 'completed') return 'completed'
  if (paymentStatus === 'deposit_paid' || paymentStatus === 'fully_paid') return 'deposit_paid'
  return 'pending'
}

/** Normalizes a raw `quotes` row (customer details live in the `config` jsonb
 *  blob since anonymous submissions never create a linked `customers` row)
 *  into the flat shape the admin Leads table renders. */
function normalizeLeadRow(row: Record<string, any>): Lead {
  const config = row.config ?? {}
  const pkg = SOLAR_PACKAGES.find((p) => p.id === config.serviceId)
  return {
    quoteId: row.quote_id,
    name: config.fullName ?? row.customers?.name ?? 'Unknown',
    phone: config.phone ?? row.customers?.phone ?? '',
    email: config.email ?? row.customers?.email ?? '',
    service: row.service_category === 'solar_package' ? 'Residential Solar' : row.service_category,
    tier: pkg?.name ?? config.serviceId ?? '—',
    location: config.province ?? '—',
    depositStatus: toDepositStatus(row.quote_status, row.payment_status),
    date: (row.created_at ?? '').slice(0, 10),
    totalUsd: Number(row.total_usd) || 0,
    depositUsd: Number(row.deposit_usd) || 0,
    source: 'website',
  }
}

const MOCK_LEADS: Lead[] = [
  { quoteId: 'FRQ-202607-0001', name: 'Tendai Moyo', phone: '+263 77 111 2222', email: 'tendai@example.com', service: 'Residential Solar', tier: '5.5kVA Solar System', location: 'Harare', depositStatus: 'pending', date: '2026-07-08', totalUsd: 3200, depositUsd: 1280, source: 'website' },
  { quoteId: 'FRQ-202607-0002', name: 'Sarah Ndlovu', phone: '+263 71 333 4444', email: 'sarah@example.com', service: 'Residential Solar', tier: '3.2kVA Solar System', location: 'Bulawayo', depositStatus: 'deposit_paid', date: '2026-07-07', totalUsd: 1800, depositUsd: 540, source: 'youtube' },
  { quoteId: 'FRQ-202607-0003', name: 'Chenai Gumbo', phone: '+263 78 555 6666', email: 'chenai@example.com', service: 'Residential Solar', tier: '8kVA Solar System', location: 'Manicaland', depositStatus: 'completed', date: '2026-07-06', totalUsd: 4800, depositUsd: 2400, source: 'referral' },
  { quoteId: 'FRQ-202607-0004', name: 'Brian Chikwanha', phone: '+263 77 777 8888', email: 'brian@example.com', service: 'Residential Solar', tier: '10kVA Solar System', location: 'Mashonaland East', depositStatus: 'deposit_paid', date: '2026-07-05', totalUsd: 6200, depositUsd: 3100, source: 'instagram' },
  { quoteId: 'FRQ-202607-0005', name: 'Rumbidzai Sithole', phone: '+263 71 999 0000', email: 'rumbi@example.com', service: 'Residential Solar', tier: '5.5kVA Solar System', location: 'Harare', depositStatus: 'cancelled', date: '2026-07-04', totalUsd: 3200, depositUsd: 1280, source: 'website' },
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

      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      let leads = (data ?? []).map(normalizeLeadRow)
      if (status) leads = leads.filter((l) => l.depositStatus === status)

      return NextResponse.json({ leads, total: leads.length, source: 'supabase' })
    } catch {
      // Fall through to mock
    }
  }

  let filtered = [...MOCK_LEADS]

  if (status) {
    filtered = filtered.filter((l) => l.depositStatus === status)
  }

  if (from) {
    const fromDate = new Date(from)
    filtered = filtered.filter((l) => new Date(l.date) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    filtered = filtered.filter((l) => new Date(l.date) <= toDate)
  }

  return NextResponse.json({ leads: filtered, total: filtered.length, source: 'mock' })
}

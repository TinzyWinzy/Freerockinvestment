import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const MOCK_QUOTES: Record<string, object> = {
  'FRQ-202607-0001': {
    id: 'FRQ-202607-0001',
    customer: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+263 77 123 4567',
      province: 'Harare',
      propertyType: 'residential',
      roofType: 'tile',
    },
    serviceId: '5.5kva',
    serviceName: '5.5kVA Solar System',
    pricing: {
      packagePrice: 3200,
      tvBundlePrice: 200,
      installationPrice: 0,
      extraPanelPrice: 0,
      auditPrice: 0,
      subtotal: 3400,
      depositRate: 0.4,
      depositAmount: 1360,
      balance: 2040,
    },
    addons: { tvBundle: true },
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      const { data, error } = await supabase
        .from('quotes')
        .select('*, customers(*)')
        .eq('quote_id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ quote: data })
    } catch {
      // Fall through to mock
    }
  }

  const quote = MOCK_QUOTES[id]

  if (!quote) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ quote })
}

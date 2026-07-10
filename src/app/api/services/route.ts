import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SOLAR_PACKAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (data) return NextResponse.json({ services: data })
    } catch {
      // Fall through to mock
    }
  }

  const services = SOLAR_PACKAGES.map((p) => ({
    id: p.id,
    kva: p.kva,
    name: p.name,
    priceUSD: p.priceUSD,
    specs: p.specs,
    popular: p.popular,
  }))

  return NextResponse.json({ services })
}

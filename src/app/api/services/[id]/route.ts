import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { SOLAR_PACKAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

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
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ service: data })
    } catch {
      // Fall through to mock
    }
  }

  const service = SOLAR_PACKAGES.find((p) => p.id === id)

  if (!service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ service })
}

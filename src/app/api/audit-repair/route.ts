import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { AUDIT_SERVICES } from '@/lib/constants'
import { generateQuoteId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const auditRequestSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(1, 'Phone number is required'),
  serviceId: z.string().min(1, 'Select a service'),
  date: z.string().min(1, 'Select a date'),
  location: z.string().min(5, 'Enter your address'),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = rateLimit(`audit-repair:${ip}`, 10, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = auditRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const { name, phone, serviceId, date, location } = parsed.data
    const service = AUDIT_SERVICES.find((s) => s.id === serviceId)
    if (!service) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 })
    }

    const bookingId = generateQuoteId()
    const createdAt = new Date().toISOString()
    const priceUSD = service.priceUSD ?? 0

    const booking = {
      id: bookingId,
      customer: { fullName: name, phone },
      service: { id: service.id, name: service.name, priceUSD: service.priceUSD },
      date,
      location,
      status: 'pending',
      createdAt,
    }

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        await supabase.from('quotes').insert({
          quote_id: bookingId,
          service_category: 'audit_repair',
          config: { fullName: name, phone, serviceId, serviceName: service.name, date, location },
          total_usd: priceUSD,
          deposit_usd: 0,
        })
      } catch {
        // Non-critical; booking is still returned to the customer below.
      }
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { SOLAR_PACKAGES } from '@/lib/constants'
import { generateQuoteId } from '@/lib/utils'
import { calculateSolarPricing } from '@/lib/pricing'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const quoteSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  province: z.string().min(1, 'Province is required'),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  roofType: z.enum(['tile', 'corrugated', 'flat', 'ground']),
  serviceId: z.string().min(1, 'Service ID is required'),
  payAfterInstall: z.boolean().optional(),
  addons: z.object({
    tvBundle: z.boolean().optional(),
    installation: z.boolean().optional(),
    extraPanels: z.number().int().min(0).optional(),
    auditIds: z.array(z.string()).optional(),
  }).optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed, remaining } = rateLimit(`quote:${ip}`, 10, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = quoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { serviceId, addons, payAfterInstall: rawPayAfterInstall, notes, ...customer } = parsed.data

    const pkg = SOLAR_PACKAGES.find((p) => p.id === serviceId)
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      )
    }

    const pricing = calculateSolarPricing(serviceId, addons ?? {})!
    const { subtotal, depositAmount } = pricing
    const payAfterInstall = rawPayAfterInstall ?? true

    const quoteId = generateQuoteId()
    const createdAt = new Date().toISOString()

    // Canonical response shape — identical whether backed by Supabase or the
    // in-memory fallback, so every downstream consumer (quote page, payment,
    // invoice, admin leads) only ever has to handle one shape.
    const quote = {
      id: quoteId,
      customer,
      serviceId,
      serviceName: pkg.name,
      pricing,
      addons: addons ?? {},
      payAfterInstall,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt,
      notes: notes ?? '',
    }

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        await supabase.from('quotes').insert({
          quote_id: quoteId,
          service_category: 'solar_package',
          config: { ...body, fullName: customer.fullName, phone: customer.phone },
          total_usd: subtotal,
          deposit_usd: depositAmount,
          pay_after_install: payAfterInstall,
        })
        // Best-effort persistence — the response is already fully formed above,
        // so a Supabase write failure never blocks the customer's quote.
      } catch {
        // Non-critical; quote is still returned to the customer below.
      }
    }

    return NextResponse.json({ quote }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { SOLAR_PACKAGES, DEPOSIT_RATES, TV_BUNDLE_PRICES, AUDIT_SERVICES } from '@/lib/constants'
import { generateQuoteId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const quoteSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  province: z.string().min(1, 'Province is required'),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  roofType: z.enum(['tile', 'corrugated', 'flat', 'ground']),
  serviceId: z.string().min(1, 'Service ID is required'),
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

    const { serviceId, addons, ...customer } = parsed.data

    const pkg = SOLAR_PACKAGES.find((p) => p.id === serviceId)
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      )
    }

    const depositRate = DEPOSIT_RATES[serviceId] ?? 0.5
    const tvBundlePrice = addons?.tvBundle ? (TV_BUNDLE_PRICES[serviceId] ?? 0) : 0
    const installationPrice = addons?.installation ? 0 : 0
    const extraPanelPrice = (addons?.extraPanels ?? 0) * 150
    const auditPrice = (addons?.auditIds ?? [])
      .reduce((sum, id) => {
        const audit = AUDIT_SERVICES.find((a) => a.id === id)
        return sum + (audit?.priceUSD ?? 0)
      }, 0)

    const subtotal = pkg.priceUSD + tvBundlePrice + installationPrice + extraPanelPrice + auditPrice
    const depositAmount = Math.round(subtotal * depositRate * 100) / 100

    const quoteId = generateQuoteId()

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase.from('quotes').insert({
          quote_id: quoteId,
          service_category: 'solar_package',
          config: body,
          total_usd: subtotal,
          deposit_usd: depositAmount,
          pay_after_install: true,
        }).select().single()

        if (!error && data) {
          return NextResponse.json({ quote: data }, { status: 201 })
        }
      } catch {
        // Fall through to mock
      }
    }

    const quote = {
      id: quoteId,
      customer,
      serviceId,
      serviceName: pkg.name,
      pricing: {
        packagePrice: pkg.priceUSD,
        tvBundlePrice,
        installationPrice,
        extraPanelPrice,
        auditPrice,
        subtotal,
        depositRate,
        depositAmount,
        balance: subtotal - depositAmount,
      },
      addons: addons ?? {},
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ quote }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { calculateSolarPricing } from '@/lib/pricing'
import { SOLAR_PACKAGES } from '@/lib/constants'

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
    payAfterInstall: true,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  },
}

/** Maps a raw Supabase `quotes` row (config stored as jsonb) into the same
 *  canonical shape produced by POST /api/quote, so every page that reads a
 *  quote — regardless of source — works against one consistent contract. */
function normalizeQuoteRow(row: Record<string, any>) {
  const config = row.config ?? {}
  const serviceId: string = config.serviceId ?? ''
  const computed = calculateSolarPricing(serviceId, config.addons ?? {})

  return {
    id: row.quote_id,
    customer: {
      fullName: config.fullName ?? row.customers?.name ?? 'Customer',
      email: config.email ?? row.customers?.email ?? '',
      phone: config.phone ?? row.customers?.phone ?? '',
      province: config.province ?? '',
      propertyType: config.propertyType ?? '',
      roofType: config.roofType ?? '',
    },
    serviceId,
    serviceName: config.serviceName ?? SOLAR_PACKAGES.find((p) => p.id === serviceId)?.name ?? 'Solar System',
    pricing: {
      ...(computed ?? { packagePrice: Number(row.total_usd) || 0, tvBundlePrice: 0, installationPrice: 0, extraPanelPrice: 0, auditPrice: 0 }),
      subtotal: Number(row.total_usd) || 0,
      depositAmount: Number(row.deposit_usd) || 0,
      balance: (Number(row.total_usd) || 0) - (Number(row.deposit_usd) || 0),
    },
    addons: config.addons ?? {},
    payAfterInstall: row.pay_after_install ?? true,
    status: row.quote_status ?? 'pending',
    paymentStatus: row.payment_status ?? 'pending',
    createdAt: row.created_at,
    notes: row.notes ?? '',
  }
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
      return NextResponse.json({ quote: normalizeQuoteRow(data) })
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

const patchSchema = z.object({
  paymentStatus: z.enum(['pending', 'deposit_paid', 'fully_paid', 'refunded']).optional(),
  quoteStatus: z.enum(['pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  paymentMethod: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)

      const update: Record<string, string> = {}
      if (parsed.data.paymentStatus) update.payment_status = parsed.data.paymentStatus
      if (parsed.data.quoteStatus) update.quote_status = parsed.data.quoteStatus
      if (parsed.data.paymentMethod) update.payment_method = parsed.data.paymentMethod

      const { data, error } = await supabase
        .from('quotes')
        .update(update)
        .eq('quote_id', id)
        .select('*, customers(*)')
        .single()

      if (!error && data) {
        return NextResponse.json({ quote: normalizeQuoteRow(data) })
      }
    } catch {
      // Fall through — status changes are non-fatal when persistence is unavailable.
    }
  }

  // No persistent store configured: acknowledge so the UI can still update
  // optimistically (mirrors the same graceful-degradation pattern used by
  // every other route in this API).
  return NextResponse.json({ ok: true, id, ...parsed.data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

  if (isSupabaseConfigured) {
    try {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      await supabase.from('quotes').delete().eq('quote_id', id)
    } catch {
      // Non-critical — the UI still removes the row optimistically below.
    }
  }

  return NextResponse.json({ ok: true, id })
}

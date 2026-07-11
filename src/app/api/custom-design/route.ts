import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { generateQuoteId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const customDesignRequestSchema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().min(1, 'Phone number is required'),
  propertySize: z.string().min(1, 'Enter property size'),
  energyUsage: z.string().min(1, 'Enter energy usage'),
  budget: z.number().min(100, 'Minimum budget $100'),
  need3D: z.boolean(),
  needFinancialAnalysis: z.boolean(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = rateLimit(`custom-design:${ip}`, 10, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = customDesignRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const requestId = generateQuoteId()
    const createdAt = new Date().toISOString()
    const { name, phone, ...design } = parsed.data

    const request_ = {
      id: requestId,
      customer: { fullName: name, phone },
      design,
      status: 'pending',
      createdAt,
    }

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)
        await supabase.from('quotes').insert({
          quote_id: requestId,
          service_category: 'custom_design',
          config: { fullName: name, phone, ...design },
          total_usd: design.budget,
          deposit_usd: 0,
        })
      } catch {
        // Non-critical; request is still returned to the customer below.
      }
    }

    return NextResponse.json({ request: request_ }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

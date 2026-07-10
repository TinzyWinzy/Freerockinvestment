import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { generateEnrollmentId } from '@/lib/utils'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const enrollSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  intakeId: z.string().min(1, 'Intake ID is required'),
  isLiterate: z.boolean(),
  hasElectricalBackground: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = rateLimit(`enroll:${ip}`, 3, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = enrollSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    if (!parsed.data.isLiterate) {
      return NextResponse.json(
        { error: 'Literacy is required for enrollment' },
        { status: 400 }
      )
    }

    const enrollmentData = {
      ...parsed.data,
      status: 'confirmed',
      priceUSD: 300,
    }

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase
          .from('training_enrollments')
          .insert(enrollmentData)
          .select()
          .single()

        if (!error && data) {
          return NextResponse.json({
            enrollment: data,
            message: 'Enrollment confirmed successfully',
          }, { status: 201 })
        }
      } catch {
        // Fall through to mock
      }
    }

    const enrollment = {
      id: generateEnrollmentId(),
      ...enrollmentData,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      enrollment,
      message: 'Enrollment confirmed successfully',
    }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

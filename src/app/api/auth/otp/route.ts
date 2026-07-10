import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { phone } = await req.json()
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const key = phone ? `otp:${phone}` : `otp:${ip}`
  const { allowed } = rateLimit(key, 5, 3600000)
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: 'OTP sent' })
}

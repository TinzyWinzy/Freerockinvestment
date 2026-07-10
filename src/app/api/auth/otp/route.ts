import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { phone } = await req.json()
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: 'OTP sent' })
}

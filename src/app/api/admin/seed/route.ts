import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password, and name required' }, { status: 400 })
  }

  // Verify admin secret to prevent public registration
  const adminSecret = request.headers.get('x-admin-secret')
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Add to admin_users table
  const { error: dbError } = await supabase.from('admin_users').insert({
    id: authData.user.id,
    email, name, role: 'admin',
  })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ message: 'Admin created', id: authData.user.id })
}

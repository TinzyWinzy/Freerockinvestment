import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone })
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_users').select('*').eq('id', user.id).single()
  return data
}

import { createBrowserClient } from '@supabase/ssr'

let _supabase: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  _supabase = createBrowserClient(url, key)
  return _supabase
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    const client = getClient()
    return (client as any)[prop]
  },
})

export async function signInWithPhone(phone: string) {
  return getClient().auth.signInWithOtp({ phone })
}

export async function signInWithPassword(email: string, password: string) {
  return getClient().auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return getClient().auth.signOut()
}

export async function getSession() {
  return getClient().auth.getSession()
}

export async function getCurrentUser() {
  const { data: { user } } = await getClient().auth.getUser()
  return user
}

export async function getCurrentAdmin() {
  const client = getClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null
  const { data } = await client.from('admin_users').select('*').eq('id', user.id).single()
  return data
}

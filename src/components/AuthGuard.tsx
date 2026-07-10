'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase'

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="skeleton w-8 h-8 rounded-full" /></div>
  if (!authenticated) return null
  return <>{children}</>
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Invalid email or password' : error.message)
      setLoading(false)
    } else {
      router.push('/admin/leads')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] to-[#228B22] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Freerock" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg" />
          <h1 className="text-xl font-bold text-[#1F2937]" style={{ fontFamily: 'var(--font-display)' }}>Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Freerock Solar Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20 focus:border-[#228B22]" placeholder="admin@freerock.co.zw" required autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#228B22]/20 focus:border-[#228B22]" placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#228B22] to-[#1a7a1a] text-white rounded-xl py-3 font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

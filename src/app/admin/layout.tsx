'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AdminAuthGuard } from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Users, Calendar, GraduationCap,
  Wrench, BarChart3, Settings, Menu, LogOut, X
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { href: '/admin/training', label: 'Training', icon: GraduationCap },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-surface-muted flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-60 flex flex-col',
        'bg-white/80 backdrop-blur-2xl border-r border-white/20 shadow-2xl shadow-black/5',
        'transform transition-transform duration-300 ease-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/30">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Freerock" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-freerock-dark">Freerock</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-surface-strong text-text-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-freerock to-freerock-lime text-white shadow-lg shadow-freerock/30'
                    : 'text-text-secondary hover:bg-black/5 hover:text-text-primary'
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]')} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border/30">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-black/5 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Back to Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-gradient-to-r from-freerock-dark via-freerock to-freerock-lime flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-white/70 hidden sm:block">Administrator Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">AD</span>
              </div>
              <span className="text-sm font-medium text-white hidden sm:block drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]">Admin</span>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/admin/login')
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </AdminAuthGuard>
  )
}

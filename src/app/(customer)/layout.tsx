'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, Phone, MessageCircle, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const PAGES_WITH_OWN_HEADER = ['/custom-design', '/audit-repair', '/training', '/contact', '/solar/payment', '/solar/payment/confirmation']

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: FileText, label: 'My Quotes', href: '/quotes' },
  { icon: Phone, label: 'Contact', href: '/contact' },
]

function isOwnHeaderPage(pathname: string): boolean {
  return PAGES_WITH_OWN_HEADER.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function needsLayoutHeader(pathname: string): boolean {
  if (pathname === '/') return false
  if (isOwnHeaderPage(pathname)) return false
  return true
}

function getBackHref(pathname: string): string | null {
  if (pathname.startsWith('/solar') || pathname === '/custom-design' || pathname === '/audit-repair' || pathname === '/training' || pathname === '/quotes' || pathname === '/contact') return '/'
  return null
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return ''
  if (pathname.startsWith('/solar')) {
    if (pathname.includes('/configure')) return 'Configure'
    if (pathname.includes('/quote')) return 'Your Quote'
    if (pathname.includes('/payment/confirmation')) return 'Confirmation'
    if (pathname.includes('/payment')) return 'Payment'
    return 'Solar Systems'
  }
  if (pathname === '/custom-design') return 'Custom Design'
  if (pathname === '/audit-repair') return 'Audit & Repair'
  if (pathname === '/training') return 'Solar Training'
  if (pathname === '/quotes') return 'My Quotes'
  if (pathname === '/contact') return 'Contact'
  return ''
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = needsLayoutHeader(pathname)
  const backHref = getBackHref(pathname)
  const title = getPageTitle(pathname)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {showHeader && (
        <header className="glass-header sticky top-0 z-30">
          <div className="flex items-center h-12 px-4">
            {backHref && (
              <Link
                href={backHref}
                className="mr-2 -ml-1 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors active:bg-black/10"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="Freerock" className="w-6 h-6 rounded-md object-cover" />
              <h1 className="text-[15px] font-bold text-[#1F2937] tracking-tight">{title}</h1>
            </div>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-[#228B22] via-[#32CD32] to-transparent opacity-60" />
        </header>
      )}

      <main className="flex-1 flex flex-col pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn('flex-1 flex flex-col', showHeader ? 'pt-14' : '')}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <a
        href="https://wa.me/263778931251"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl pl-4 pr-5 py-3 flex items-center gap-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(37,211,102,0.35)]"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>

      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="glass-nav flex items-center justify-around h-[72px] shadow-[0_-2px_20px_rgba(0,0,0,0.04)]">
          {navItems.map((n) => {
            const isActive = pathname === n.href
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200',
                  isActive ? 'text-[#228B22]' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#228B22] rounded-b-full shadow-[0_0_10px_rgba(34,139,34,0.25)]" />
                )}
                <div className={cn('w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-200', isActive ? 'bg-[#228B22]/10 scale-110' : '')}>
                  <n.icon className="w-[18px] h-[18px]" />
                </div>
                <span className={cn('text-[10px] font-medium tracking-tight transition-all', isActive ? 'font-bold' : '')}>{n.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

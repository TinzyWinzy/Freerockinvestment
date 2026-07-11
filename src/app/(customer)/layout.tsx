'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Sun, GraduationCap, FileText, Phone, MessageCircle, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getWhatsAppLink } from '@/lib/whatsapp'

const PAGES_WITH_OWN_HEADER = ['/custom-design', '/audit-repair', '/training', '/contact', '/solar/payment', '/solar/payment/confirmation']

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Sun, label: 'Solar', href: '/solar' },
  { icon: GraduationCap, label: 'Training', href: '/training' },
  { icon: FileText, label: 'Quotes', href: '/quotes' },
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
  if (pathname.startsWith('/solar/quote') || pathname.startsWith('/solar/payment')) return '/solar'
  if (pathname.startsWith('/solar')) return '/solar'
  if (pathname === '/quotes') return '/'
  return null
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return ''
  if (pathname.startsWith('/solar')) {
    if (pathname.includes('/configure')) return 'Configure'
    if (pathname.includes('/quote')) return 'Your Quote'
    if (pathname.includes('/payment/confirmation')) return 'Confirmation'
    if (pathname.includes('/payment')) return 'Payment'
    return 'Solar Packages'
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

  const isHome = pathname === '/'

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* ─── Mobile top header (hidden on lg+) ─── */}
      {showHeader && (
        <header className="lg:hidden glass-header sticky top-0 z-30">
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

      <main className={cn(
        'flex-1 flex flex-col',
        !isHome && 'pb-[72px] lg:pb-0',
        showHeader && 'pt-12 lg:pt-0'
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Desktop nav bar ─── */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Freerock" className="w-7 h-7 rounded-md object-cover" />
            <span className="font-bold text-[#1F2937] text-sm">Freerock</span>
          </Link>
          <nav className="ml-8 flex items-center gap-1">
            {navItems.map((n) => {
              const isActive = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href))
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-[#228B22] bg-[#228B22]/10' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  )}
                >
                  {n.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!isHome && backHref && (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Link>
          )}
          <a
            href={getWhatsAppLink("Hi Freerock, I'd like to find out more about your solar services.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </header>

      {/* ─── Mobile floating WhatsApp (hidden on lg+) ─── */}
      <a
        href={getWhatsAppLink("Hi Freerock, I'd like to find out more about your solar services.")}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden fixed bottom-[88px] right-4 z-40 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl pl-4 pr-5 py-3 flex items-center gap-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>

      {/* ─── Mobile bottom nav (hidden on lg+) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="glass-nav flex items-center justify-around h-[72px] shadow-[0_-2px_20px_rgba(0,0,0,0.04)]">
          {navItems.map((n) => {
            const isActive = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href))
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
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#228B22] rounded-b-full" />
                )}
                <div className={cn('w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200', isActive ? 'scale-110' : '')}>
                  <n.icon className="w-[18px] h-[18px]" />
                </div>
                <span className={cn('text-[10px] font-medium tracking-tight', isActive ? 'font-bold' : '')}>{n.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { SOLAR_PACKAGES } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { Container } from '@/components/Container'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function SolarPageContent() {
  const router = useRouter()
  const { setWizard } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleConfigure = (packageId: string) => {
    setWizard({ packageId, step: 0 })
    router.push('/solar/configure')
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 pb-5">
        <Container>
          <section className="pt-5 pb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="space-y-1.5">
                <div className="h-5 w-44 skeleton rounded-md" />
                <div className="h-3 w-64 skeleton rounded-md" />
              </div>
            </div>
          </section>
        </Container>
        <Container>
          <section className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card !rounded-2xl !shadow-sm overflow-hidden">
              <div className="p-5 pb-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-36 skeleton rounded-md" />
                  <div className="h-5 w-14 skeleton rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="rounded-xl p-2.5 space-y-1">
                      <div className="h-3 w-10 skeleton rounded" />
                      <div className="h-3 w-14 skeleton rounded" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <div className="h-6 w-20 skeleton rounded" />
                    <div className="h-3 w-10 skeleton rounded" />
                  </div>
                  <div className="h-5 w-28 skeleton rounded-full" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="h-11 w-full skeleton rounded-xl" />
              </div>
            </div>
          ))}
        </section>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 pb-5">
      <Container>
        <section className="relative overflow-hidden rounded-2xl pt-5 pb-3">
          <Image src="/images/packages.jpg" alt="" fill className="object-cover opacity-15" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB]/0 via-[#F9FAFB]/60 to-[#F9FAFB]" />
        <div className="relative z-10 flex items-center gap-3 mb-1">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#228B22] via-[#32CD32] to-[#86ef86] flex items-center justify-center shadow-lg shadow-[#228B22]/20"
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="heading-lg !text-[#1F2937]">Solar Packages</h2>
            <p className="text-xs text-gray-500">Systems designed for Zimbabwean homes and businesses</p>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-[#228B22]/40 via-[#32CD32]/20 to-transparent" />
      </section>
      </Container>

      <Container>
        <motion.section
          className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {SOLAR_PACKAGES.map((pkg) => (
          <motion.div
            key={pkg.id}
            variants={cardVariants}
            whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(34,139,34,0.12), 0 4px 12px rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.99 }}
            className="card !rounded-2xl !shadow-sm relative overflow-hidden group/card"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#228B22] via-[#32CD32] to-[#86ef86] scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500 ease-out origin-left" />

            {pkg.popular && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="absolute top-3 right-3 z-10"
              >
                <span className="bg-gradient-to-r from-[#32CD32] via-[#228B22] to-[#1a7a1a] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-[#228B22]/30 tracking-wider inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  MOST POPULAR
                </span>
              </motion.div>
            )}

            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#1F2937]">{pkg.name}</h3>
                <span className="bg-[#228B22]/10 text-[#228B22] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {pkg.kva.toFixed(1)}kVA
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Inverter', value: pkg.specs.inverter.split(' ').slice(0, 2).join(' ') },
                  { label: 'Battery', value: pkg.specs.battery },
                  { label: 'Panels', value: pkg.specs.panels },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#F9FAFB] rounded-xl p-2.5 transition-colors duration-300 hover:bg-[#F0FDF4]"
                  >
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{s.label}</p>
                    <p className="text-[11px] font-semibold text-[#1F2937] mt-0.5 leading-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#1F2937]">{formatUSD(pkg.priceUSD)}</span>
                  <span className="text-[10px] text-gray-400">one-time</span>
                </div>
                <span className="text-[10px] text-[#228B22] border border-[#228B22]/30 rounded-full px-2.5 py-1 inline-flex items-center gap-1 bg-[#228B22]/5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Pay AFTER Install
                </span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <motion.button
                onClick={() => handleConfigure(pkg.id)}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm group/btn cursor-pointer"
              >
                <span>Configure System</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.section>
      </Container>
    </div>
  )
}

export default function SolarPage() {
  return (
    <ErrorBoundary>
      <SolarPageContent />
    </ErrorBoundary>
  )
}

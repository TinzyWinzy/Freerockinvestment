'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Sun, Ruler, Search, GraduationCap, ShieldCheck, ChevronRight, Zap, Play, Clock } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { SITE } from '@/lib/constants'

const services = [
  { icon: Sun, title: 'Solar Systems', desc: 'Instant quote for your home or business', href: '/solar', color: '#228B22' },
  { icon: Ruler, title: 'Custom Design', desc: '3D visualization & annual simulation', href: '/custom-design', color: '#2563EB' },
  { icon: Search, title: 'Audit & Repair', desc: 'Energy audit, fault finding, diagnosis', href: '/audit-repair', color: '#D97706' },
  { icon: GraduationCap, title: 'Solar Training', desc: '2-week certified installation course', href: '/training', color: '#7C3AED' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export default function Home() {
  const countRef = useRef<HTMLSpanElement>(null)
  const isCountInView = useInView(countRef, { once: true, amount: 0.5 })

  return (
    <>
      <style>{`
        @property --num {
          syntax: '<integer>';
          inherits: false;
          initial-value: 0;
        }
        .hero-grad {
          background: linear-gradient(145deg, #0a2e0a 0%, #1a6b1a 25%, #3a8a3a 50%, #8a9a3a 75%, #c4a83d 100%);
          background-size: 200% 200%;
          animation: dawnShift 20s ease infinite;
        }
        @keyframes dawnShift {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        .sunburst {
          position: absolute;
          inset: -50%;
          background: conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.03) 15deg, transparent 30deg, rgba(255,215,0,0.05) 45deg, transparent 60deg, rgba(255,215,0,0.02) 75deg, transparent 90deg, rgba(255,215,0,0.04) 105deg, transparent 120deg);
          animation: sunburstSpin 40s linear infinite;
          pointer-events: none;
        }
        @keyframes sunburstSpin {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1); }
        }
        .float-shape { position: absolute; pointer-events: none; }
        .float-1 {
          width: 80px; height: 80px; top: 12%; left: -8%;
          background: radial-gradient(circle at 30% 30%, rgba(255,215,0,0.25), transparent);
          border-radius: 50%;
          animation: floatA 12s ease-in-out infinite;
        }
        .float-2 {
          width: 60px; height: 60px; top: 65%; right: -5%;
          background: radial-gradient(circle at 70% 30%, rgba(50,205,50,0.2), transparent);
          border-radius: 30%;
          animation: floatB 10s ease-in-out infinite;
        }
        .float-3 {
          width: 40px; height: 40px; top: 28%; right: 12%;
          border-radius: 10px;
          border: 2px solid rgba(255,215,0,0.15);
          transform: rotate(45deg);
          animation: floatC 8s ease-in-out infinite;
        }
        .float-4 {
          width: 20px; height: 20px; top: 75%; left: 15%;
          border-radius: 50%;
          background: rgba(255,215,0,0.12);
          animation: floatD 14s ease-in-out infinite;
        }
        @keyframes floatA {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(35px, -45px) rotate(120deg); }
          66% { transform: translate(-25px, -20px) rotate(240deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, -40px) rotate(-90deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: rotate(45deg) translate(0, 0); }
          25% { transform: rotate(45deg) translate(15px, -25px) scale(1.2); }
          75% { transform: rotate(45deg) translate(-10px, 15px) scale(0.9); }
        }
        @keyframes floatD {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(15px, -20px); opacity: 1; }
        }
        .trust-grad {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7, #bbf7d0, #dcfce7, #f0fdf4);
          background-size: 300% 300%;
          animation: dawnShift 10s ease infinite;
        }
        .trust-fl-1 {
          position: absolute; top: -30px; right: -20px;
          width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,139,34,0.1), transparent);
          pointer-events: none;
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .trust-fl-2 {
          position: absolute; bottom: -20px; left: -10px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(50,205,50,0.07), transparent);
          pointer-events: none;
          animation: pulse-glow 8s ease-in-out infinite reverse;
        }
        .count-el {
          display: inline-block;
          counter-reset: cnt var(--num, 0);
        }
        .count-el.go::after {
          content: counter(cnt);
        }
        .count-el.go {
          --num: 0;
          animation: countUp 2s ease-out 0.2s forwards;
        }
        @keyframes countUp {
          to { --num: 25; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-grad, .trust-grad { animation: none; }
          .sunburst { animation: none; display: none; }
          .float-shape { animation: none; display: none; }
          .trust-fl-1, .trust-fl-2 { animation: none; }
          .count-el.go { --num: 25; }
        }
      `}</style>

      <div className="flex flex-col min-h-full pb-24">
        {/* ─── Hero: Dawn Over Zimbabwe ─── */}
        <section className="relative overflow-hidden hero-grad px-6 pt-16 pb-8 text-white min-h-[520px] flex flex-col justify-between">
          <div className="sunburst" />
          <div className="float-shape float-1" />
          <div className="float-shape float-2" />
          <div className="float-shape float-3" />
          <div className="float-shape float-4" />

          <div className="relative z-10 flex-1 flex flex-col justify-center pt-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-11 h-11 rounded-2xl bg-white/[0.12] backdrop-blur-md flex items-center justify-center mb-5 ring-1 ring-white/10"
            >
              <Zap className="w-5 h-5 text-[#32CD32]" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="heading-xl text-white"
            >
              Power Your Future<br />
              <span className="text-gradient">with Freerock</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-base text-white/70 max-w-sm leading-relaxed"
            >
              Zimbabwe&apos;s trusted solar partner — instant quotes, expert installation, and certified training.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/solar" className="btn-primary inline-flex items-center gap-2 text-sm">
                Get Instant Quote <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/[0.08] backdrop-blur-lg border border-white/[0.15] text-white/90 text-sm font-semibold hover:bg-white/[0.15] hover:border-white/[0.25] hover:text-white transition-all duration-300 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch on YouTube
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/[0.08]">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32CD32] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#32CD32]" />
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-white/90">
                <span ref={countRef} className={`count-el ${isCountInView ? 'go' : ''}`} />
                <span className="text-white/60 font-medium">YouTube Subscribers</span>
              </span>
            </div>
          </motion.div>
        </section>

        {/* ─── Service Cards: Framer Motion Staggered ─── */}
        <section className="-mt-5 relative z-20">
          <Container>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="space-y-3"
            >
              {services.map((s) => (
                <motion.div
                  key={s.href}
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    boxShadow: `0 12px 40px ${s.color}1A, 0 4px 12px ${s.color}0D`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Link
                    href={s.href}
                    className="card group flex items-center gap-4 p-4 min-h-[104px]"
                    style={{ borderLeftColor: s.color, borderLeftWidth: '3px' }}
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-white/60 backdrop-blur-sm ring-1 ring-black/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3" style={{ color: s.color }}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-[#1F2937] text-[15px] leading-snug">{s.title}</h2>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                      <span
                        className="text-xs font-semibold mt-1.5 inline-flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                        style={{ color: s.color }}
                      >
                        Get Started <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* ─── Trust Badge: Pay AFTER Installation ─── */}
        <Container className="mt-5">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl trust-grad border border-[#32CD32]/20 p-5">
              <div className="trust-fl-1" />
              <div className="trust-fl-2" />
              <div className="relative z-10">
                <ShieldCheck className="w-6 h-6 text-[#228B22] mb-2" />
                <p className="text-base font-bold text-[#1F2937] leading-snug">Pay AFTER Installation</p>
                <p className="text-sm text-gray-600 mt-0.5">Deposit secures your date, balance on completion — <span className="font-semibold text-[#228B22]">zero risk, full trust</span></p>
                <div className="mt-3 pt-3 border-t border-[#228B22]/10 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#228B22]" /> 2-year warranty
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>5-year inverter</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>10-year panels</span>
                </div>
              </div>
            </div>
          </motion.section>
        </Container>

        {/* ─── YouTube Social Proof ─── */}
        <Container className="mt-3">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="card-static p-5 text-center">
              <div className="inline-flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32CD32] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#32CD32]" />
                </span>
                <YoutubeLogo className="w-5 h-5 text-[#FF0000]" />
                <span className="text-sm font-bold text-[#1F2937]">25K+ YouTube Subscribers</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Join thousands of Zimbabweans powering their future with solar</p>
            </div>
          </motion.section>
        </Container>
      </div>
    </>
  )
}

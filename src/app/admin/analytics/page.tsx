'use client'

import { useState, useEffect } from 'react'
import { cn } from '../../../lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, CheckCircle, Zap, Download, Users, BarChart3 } from 'lucide-react'
import { API } from '@/lib/api'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.admin.analytics().then((res) => {
      setData(res)
    }).catch(() => {
      // Silently falls through — page renders zero state if no data returned.
    }).finally(() => setLoading(false))
  }, [])

  const summary = data?.summary ?? { totalQuotes: 0, totalRevenue: 0, conversionRate: 0, averageQuoteValue: 0 }

  const METRICS = [
    { label: 'Total Quotes', value: String(summary.totalQuotes), change: '', positive: true, icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Deposit Paid', value: String(summary.depositPaid ?? 0), change: '', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Fully Paid', value: String(summary.fullyPaid ?? 0), change: '', positive: true, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Revenue', value: `$${(summary.totalRevenue ?? 0).toLocaleString()}`, change: '', positive: true, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Conversion', value: `${Math.round((summary.conversionRate ?? 0) * 100)}%`, change: '', positive: true, icon: <Zap className="w-5 h-5" /> },
    { label: 'Avg. Quote', value: `$${(summary.averageQuoteValue ?? 0).toLocaleString()}`, change: '', positive: true, icon: <Users className="w-5 h-5" /> },
  ]

  const revenueByService = data?.revenueByService ?? []
  const leadSources = data?.leadSources ?? []
  const quotesOverTime = data?.quotesOverTime ?? []
  const maxRevenue = Math.max(...revenueByService.map((r: any) => r.revenue), 1)

  const handleExport = () => {
    const headers = ['Metric', 'Value']
    const rows = METRICS.map(m => [m.label, m.value])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freerock-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-static p-4"><div className="skeleton h-8 w-20 rounded-md mb-2" /><div className="skeleton h-4 w-28 rounded-md" /></div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Analytics</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6" role="table" aria-label="Key metrics">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-static relative overflow-hidden"
          >
            <div className={cn(
              'absolute top-0 left-0 right-0 h-1',
              m.positive ? 'bg-gradient-to-r from-freerock to-freerock-lime' : 'bg-gradient-to-r from-danger to-red-400'
            )} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{m.label}</span>
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shadow-lg',
                  m.positive
                    ? 'bg-gradient-to-br from-freerock/20 to-freerock/5 text-freerock'
                    : 'bg-gradient-to-br from-danger/20 to-danger/5 text-danger'
                )}>
                  {m.icon}
                </div>
              </div>
              <p className="text-xl font-bold">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {quotesOverTime.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-static p-5"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-freerock" /> Quotes Over Time</h2>
            <div className="space-y-3">
              {quotesOverTime.map((q: any, i: number) => (
                <div key={q.month} className="flex justify-between text-sm p-2 border-b border-border/30">
                  <span className="font-medium">{q.month}</span>
                  <span className="font-bold text-freerock-dark">{q.count} ({q.totalValue ? `$${q.totalValue.toLocaleString()}` : ''})</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-freerock" /> Revenue by Service</h2>
          {revenueByService.length === 0 ? (
            <p className="text-sm text-text-secondary">No revenue data available yet.</p>
          ) : (
            <div className="space-y-4">
              {revenueByService.map((s: any, i: number) => {
                const pct = (s.revenue / maxRevenue) * 100
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{s.serviceId}</span>
                      <span className="font-bold text-freerock-dark">${s.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-surface-strong rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                        className="h-full rounded-full bg-gradient-to-r from-freerock to-freerock-lime"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-freerock" /> Lead Sources</h2>
          {leadSources.length === 0 ? (
            <p className="text-sm text-text-secondary">No lead source data available yet.</p>
          ) : (
            <div className="space-y-4">
              {leadSources.map((ls: any, i: number) => {
                const maxCount = Math.max(...leadSources.map((l: any) => l.count), 1)
                const pct = (ls.count / maxCount) * 100
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{ls.source}</span>
                      <span className="font-bold text-freerock-dark">{ls.count}</span>
                    </div>
                    <div className="h-4 bg-surface-strong rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 + i * 0.06 }}
                        className="h-full rounded-full bg-gradient-to-r from-freerock to-freerock-lime"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-freerock" /> Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Quotes', value: String(summary.totalQuotes ?? 0) },
              { label: 'Total Revenue', value: `$${(summary.totalRevenue ?? 0).toLocaleString()}` },
              { label: 'Conversion Rate', value: `${Math.round((summary.conversionRate ?? 0) * 100)}%`, highlight: true },
              { label: 'Avg. Quote Value', value: `$${(summary.averageQuoteValue ?? 0).toLocaleString()}` },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className={cn(
                  'flex items-center justify-between p-3.5 rounded-xl border transition-all hover:shadow-sm',
                  item.highlight
                    ? 'bg-gradient-to-r from-positive/[0.06] to-transparent border-positive/20'
                    : 'bg-gradient-to-r from-surface-muted/80 to-white/50 border-border/30'
                )}
              >
                <span className="text-sm font-medium">{item.label}</span>
                <span className={cn('font-bold', item.highlight ? 'text-positive' : 'text-freerock-dark')}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

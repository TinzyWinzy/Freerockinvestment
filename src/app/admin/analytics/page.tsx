'use client'

import { useState } from 'react'
import { cn } from '../../../lib/utils'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, CheckCircle, Zap, Download, Users, BarChart3 } from 'lucide-react'

interface MetricCard {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
}

interface ServiceRevenue {
  service: string
  revenue: number
  color: string
}

interface LeadSource {
  source: string
  pct: number
  color: string
}

const METRICS: MetricCard[] = [
  { label: 'Quotes Today', value: '12', change: '+20% vs yesterday', positive: true, icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Quotes This Week', value: '64', change: '+8% vs last week', positive: true, icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Quotes This Month', value: '187', change: '+15% vs last month', positive: true, icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Conversion Rate', value: '34%', change: '+2pp vs last month', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Revenue (MTD)', value: '$142,500', change: '+12% vs last month', positive: true, icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Install Completion', value: '89%', change: '42 of 47 completed', positive: true, icon: <CheckCircle className="w-5 h-5" /> },
]

const SERVICE_REVENUE: ServiceRevenue[] = [
  { service: 'Residential Solar', revenue: 82000, color: 'bg-gradient-to-r from-freerock to-freerock-lime' },
  { service: 'Commercial Solar', revenue: 45000, color: 'bg-gradient-to-r from-freerock-lime to-green-300' },
  { service: 'Solar Water Heating', revenue: 10500, color: 'bg-gradient-to-r from-chart-3 to-emerald-300' },
  { service: 'Solar Pumping', revenue: 5000, color: 'bg-gradient-to-r from-chart-4 to-green-200' },
]

const LEAD_SOURCES: LeadSource[] = [
  { source: 'Website', pct: 35, color: 'bg-gradient-to-r from-freerock to-freerock-lime' },
  { source: 'Referral', pct: 25, color: 'bg-gradient-to-r from-freerock-lime to-green-300' },
  { source: 'Social Media', pct: 20, color: 'bg-gradient-to-r from-chart-3 to-emerald-300' },
  { source: 'Walk-in', pct: 12, color: 'bg-gradient-to-r from-chart-4 to-green-200' },
  { source: 'Partner', pct: 8, color: 'bg-gradient-to-r from-chart-5 to-gray-300' },
]

const WEEKLY_DATA = [8, 12, 15, 10, 18, 22, 14, 20, 25, 19, 28, 30, 24, 18]
const MAX_WEEKLY = Math.max(...WEEKLY_DATA)

function Bar({ val, max, i, prev }: { val: number; max: number; i: number; prev?: number }) {
  const height = (val / max) * 100
  const isUp = prev !== undefined && val >= prev
  return (
    <motion.div
      className="flex-1 flex flex-col items-center gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.04 }}
    >
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.04 }}
        className={cn(
          'w-full rounded-t-lg transition-all hover:opacity-80 relative group',
          isUp ? 'bg-gradient-to-t from-freerock to-freerock-lime' : 'bg-gradient-to-t from-freerock-lime to-green-200'
        )}
        title={`Week ${i + 1}: ${val}`}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-freerock-dark text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
          {val}
        </div>
      </motion.div>
      {i % 2 === 0 && <span className="text-[10px] text-text-tertiary font-medium">W{i + 1}</span>}
    </motion.div>
  )
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AnalyticsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Analytics</h1>
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {METRICS.map((m, i) => (
          <motion.div
            key={i}
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
              <p className={cn('text-xs mt-1 font-medium', m.positive ? 'text-positive' : 'text-danger')}>{m.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-freerock" /> Weekly Quotes</h2>
          <div className="flex items-end gap-1.5 h-48">
            {WEEKLY_DATA.map((val, i) => (
              <Bar key={i} val={val} max={MAX_WEEKLY} i={i} prev={i > 0 ? WEEKLY_DATA[i - 1] : undefined} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gradient-to-b from-freerock to-freerock-lime" /> Up</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gradient-to-b from-freerock-lime to-green-200" /> Down</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-freerock" /> Revenue by Service</h2>
          <div className="space-y-4">
            {SERVICE_REVENUE.map((s, i) => {
              const maxRev = Math.max(...SERVICE_REVENUE.map(r => r.revenue))
              const pct = (s.revenue / maxRev) * 100
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.service}</span>
                    <span className="font-bold text-freerock-dark">${s.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-surface-strong rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                      className={cn('h-full rounded-full shadow-sm', s.color)}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
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
          <div className="space-y-4">
            {LEAD_SOURCES.map((ls, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
              >
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{ls.source}</span>
                  <span className="font-bold text-freerock-dark">{ls.pct}%</span>
                </div>
                <div className="h-4 bg-surface-strong rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ls.pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 + i * 0.06 }}
                    className={cn('h-full rounded-full shadow-sm', ls.color)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="card-static p-5"
        >
          <h2 className="font-semibold flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-freerock" /> Performance Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Avg. Quote Value', value: '$4,850' },
              { label: 'Avg. Install Time', value: '3.2 days' },
              { label: 'Customer Satisfaction', value: '4.8 / 5.0', highlight: true },
              { label: 'Repeat Customer Rate', value: '22%' },
              { label: 'Top Performing Area', value: 'Harare' },
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

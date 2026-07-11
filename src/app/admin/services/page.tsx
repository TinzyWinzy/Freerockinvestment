'use client'

import { useState } from 'react'
import { cn } from '../../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Edit, Gift, DollarSign, Save, X, Wifi } from 'lucide-react'
import { API } from '@/lib/api'

interface PackageItem {
  id: number
  name: string
  tier: string
  price: number
  active: boolean
  description: string
}

interface Campaign {
  id: number
  name: string
  gift: string
  active: boolean
}

const MOCK_PACKAGES: PackageItem[] = [
  { id: 1, name: 'Basic 3kW', tier: 'Residential', price: 2500, active: true, description: '3kW solar system, 4 panels, 1 battery' },
  { id: 2, name: 'Standard 5kW', tier: 'Residential', price: 4500, active: true, description: '5kW solar system, 8 panels, 2 batteries' },
  { id: 3, name: 'Premium 10kW', tier: 'Residential', price: 8500, active: true, description: '10kW solar system, 16 panels, 4 batteries' },
  { id: 4, name: 'Small 15kW', tier: 'Commercial', price: 15000, active: false, description: '15kW commercial system' },
  { id: 5, name: 'Medium 30kW', tier: 'Commercial', price: 28000, active: true, description: '30kW commercial system' },
  { id: 6, name: 'Large 50kW', tier: 'Commercial', price: 45000, active: true, description: '50kW commercial system' },
]

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, name: 'Winter Special', gift: 'Free LED TV (32")', active: true },
  { id: 2, name: 'Referral Program', gift: 'Free Installation', active: true },
  { id: 3, name: 'Holiday Promo', gift: 'Free Battery Upgrade', active: false },
]

const TIER_DESIGNS: Record<string, { gradient: string; accent: string }> = {
  Residential: { gradient: 'from-freerock/[0.03] to-transparent', accent: 'border-l-4 border-l-freerock' },
  Commercial: { gradient: 'from-blue-500/[0.03] to-transparent', accent: 'border-l-4 border-l-blue-500' },
}

export default function ServicesPage() {
  const [packages, setPackages] = useState(MOCK_PACKAGES)
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)
  const [rbzRate, setRbzRate] = useState('26.50')
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null)
  const [editForm, setEditForm] = useState({ name: '', price: 0, description: '' })
  const [tvBundle, setTvBundle] = useState('Free 32" LED TV with Premium 10kW')
  const [rateSaved, setRateSaved] = useState(false)
  const [rateSaving, setRateSaving] = useState(false)

  const saveRate = async () => {
    setRateSaving(true)
    try {
      const res = await API.rate.update(parseFloat(rbzRate) || 0)
      if (!res.error) {
        setRateSaved(true)
        setTimeout(() => setRateSaved(false), 2000)
      }
    } catch { }
    setRateSaving(false)
  }

  const togglePackage = (id: number) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const openEdit = (pkg: PackageItem) => {
    setEditingPkg(pkg)
    setEditForm({ name: pkg.name, price: pkg.price, description: pkg.description })
  }

  const saveEdit = () => {
    if (!editingPkg) return
    setPackages(prev => prev.map(p => p.id === editingPkg.id ? { ...p, name: editForm.name, price: editForm.price, description: editForm.description } : p))
    setEditingPkg(null)
  }

  const toggleCampaign = (id: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Services</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-static overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-surface-muted/80 to-white/50 flex items-center gap-2">
              <Package className="w-5 h-5 text-freerock" />
              <h2 className="font-semibold">Solar Packages</h2>
            </div>
            <div className="divide-y divide-border/50">
              {packages.map((pkg, i) => {
                const design = TIER_DESIGNS[pkg.tier] || { gradient: '', accent: '' }
                const isEven = i % 2 === 0
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'p-4 flex items-center justify-between transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 relative',
                      design.accent,
                      isEven ? 'bg-white' : 'bg-surface-muted/30'
                    )}
                  >
                    <div className={cn('absolute inset-0 bg-gradient-to-r pointer-events-none', design.gradient)} />
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{pkg.name}</span>
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          pkg.tier === 'Residential' ? 'bg-freerock/10 text-freerock' : 'bg-blue-500/10 text-blue-600'
                        )}>
                          {pkg.tier}
                        </span>
                        {pkg.active ? (
                          <span className="text-xs text-positive font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-positive shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-text-tertiary font-medium">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-freerock mt-0.5">${pkg.price.toLocaleString()}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">{pkg.description}</p>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={pkg.active}
                          onChange={() => togglePackage(pkg.id)}
                        />
                        <div className={cn(
                          'w-11 h-6 rounded-full transition-all duration-300 peer-focus:ring-2 peer-focus:ring-freerock/30',
                          pkg.active
                            ? 'bg-gradient-to-r from-freerock to-freerock-lime shadow-sm'
                            : 'bg-border/70'
                        )}>
                          <div className={cn(
                            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300',
                            pkg.active ? 'translate-x-5 shadow-freerock/30' : 'translate-x-0'
                          )} />
                        </div>
                      </label>
                      <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg hover:bg-black/5 text-text-secondary transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="card-static overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-surface-muted/80 to-white/50 flex items-center gap-2">
              <Gift className="w-5 h-5 text-freerock" />
              <h2 className="font-semibold">Promotions</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-2 block">Free Gift Campaigns</label>
                <div className="space-y-2">
                  {campaigns.map((campaign, i) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-surface-muted/80 to-white/50 border border-border/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm',
                          campaign.active ? 'from-freerock to-freerock-lime' : 'from-border to-border/50'
                        )}>
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <p className="text-xs text-text-secondary">{campaign.gift}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={campaign.active}
                          onChange={() => toggleCampaign(campaign.id)}
                        />
                        <div className={cn(
                          'w-11 h-6 rounded-full transition-all duration-300 peer-focus:ring-2 peer-focus:ring-freerock/30',
                          campaign.active
                            ? 'bg-gradient-to-r from-freerock to-freerock-lime shadow-sm'
                            : 'bg-border/70'
                        )}>
                          <div className={cn(
                            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300',
                            campaign.active ? 'translate-x-5 shadow-freerock/30' : 'translate-x-0'
                          )} />
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">TV Bundle Pricing</label>
                <input
                  type="text"
                  value={tvBundle}
                  onChange={e => setTvBundle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-static overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-surface-muted/80 to-white/50 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-freerock" />
              <h2 className="font-semibold">RBZ Rate Override</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-positive shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                </span>
                <span className="text-xs font-medium text-positive">Live</span>
              </div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">Exchange Rate (ZWL/USD)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rbzRate}
                  onChange={e => setRbzRate(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all"
                />
                <button onClick={saveRate} disabled={rateSaving} className="px-3 py-2.5 bg-gradient-to-r from-freerock to-freerock-lime text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-freerock/30 transition-all cursor-pointer border-none">
                  {rateSaving ? <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-3 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-positive" /> Overrides the official RBZ rate for quote calculations.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="card-static p-5"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-freerock" /> Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-freerock/[0.04] to-transparent border border-freerock/10">
                <span className="text-text-secondary">Active Packages</span>
                <span className="font-bold text-freerock">{packages.filter(p => p.active).length}</span>
              </div>
              <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-border/30 to-transparent border border-border/20">
                <span className="text-text-secondary">Inactive Packages</span>
                <span className="font-bold text-text-primary">{packages.filter(p => !p.active).length}</span>
              </div>
              <div className="flex justify-between text-sm p-3 rounded-xl bg-gradient-to-r from-freerock/[0.04] to-transparent border border-freerock/10">
                <span className="text-text-secondary">Active Campaigns</span>
                <span className="font-bold text-freerock">{campaigns.filter(c => c.active).length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {editingPkg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingPkg(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Edit Package"
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Edit Package</h3>
              <button onClick={() => setEditingPkg(null)} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Package Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Price (USD)</label>
                <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all resize-none" />
              </div>
              <button onClick={saveEdit} className="btn-primary w-full text-center">Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

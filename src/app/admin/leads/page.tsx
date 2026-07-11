'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '../../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MoreHorizontal, Eye, UserCheck,
  RefreshCw, MessageSquare, Trash2, X, CheckCircle, AlertCircle, Clock,
  Users, CalendarDays, Hourglass, Award
} from 'lucide-react'
import { API } from '@/lib/api'
import type { Lead, DepositStatus } from '@/app/api/admin/leads/route'

const STATUS_CONFIG: Record<DepositStatus, { label: string; class: string }> = {
  deposit_paid: { label: 'Deposit Paid', class: 'bg-gradient-to-r from-positive/20 to-positive/10 text-positive border border-positive/30 shadow-[0_0_12px_rgba(34,197,94,0.2)]' },
  pending: { label: 'Pending', class: 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border border-warning/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]' },
  cancelled: { label: 'Cancelled', class: 'bg-gradient-to-r from-danger/20 to-danger/10 text-danger border border-danger/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]' },
  completed: { label: 'Completed', class: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]' },
}

const SERVICE_TYPES = ['All', 'Residential Solar', 'Commercial Solar', 'Solar Water Heating', 'Solar Pumping']
const LOCATIONS = ['All', 'Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Masvingo', 'Kwekwe']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [statusModal, setStatusModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null })
  const [showFilters, setShowFilters] = useState(false)
  const [deleteModal, setDeleteModal] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      const params: Record<string, string> = {}
      if (statusFilter !== 'All') params.status = statusFilter
      const res = await API.admin.leads(params)
      if (res.leads) setLeads(res.leads)
    } catch {
      // Server unavailable — page degrades to showing last-fetched data.
    }
  }, [statusFilter])

  useEffect(() => {
    fetchLeads().finally(() => setLoading(false))
  }, [fetchLeads])

  const filteredLeads = leads.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.quoteId.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search)) return false
    if (serviceFilter !== 'All' && l.service !== serviceFilter) return false
    if (locationFilter !== 'All' && l.location !== locationFilter) return false
    return true
  })

  const handleStatusUpdate = async (newStatus: DepositStatus) => {
    if (!statusModal.lead) return
    const updated = leads.map(l => l.quoteId === statusModal.lead!.quoteId ? { ...l, depositStatus: newStatus } : l)
    setLeads(updated)
    setStatusModal({ open: false, lead: null })
    // Best-effort persistence
    API.quote.update(statusModal.lead.quoteId, { paymentStatus: newStatus }).catch(() => {})
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setLeads(prev => prev.filter(l => l.quoteId !== deleteModal.quoteId))
    setDeleteModal(null)
    API.quote.remove(deleteModal.quoteId).catch(() => {})
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const totalLeads = leads.length
  const todayCount = leads.filter(l => l.date === todayStr).length
  const pendingCount = leads.filter(l => l.depositStatus === 'pending').length
  const completedCount = leads.filter(l => l.depositStatus === 'completed').length

  const statCards = [
    { label: 'Total Leads', value: totalLeads, icon: Users, gradient: 'from-freerock to-freerock-lime', glow: 'shadow-freerock/25' },
    { label: 'Today', value: todayCount, icon: CalendarDays, gradient: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/25' },
    { label: 'Pending', value: pendingCount, icon: Hourglass, gradient: 'from-warning to-orange-500', glow: 'shadow-warning/25' },
    { label: 'Completed', value: completedCount, icon: Award, gradient: 'from-positive to-emerald-500', glow: 'shadow-positive/25' },
  ]

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-static p-4"><div className="skeleton h-8 w-16 rounded-md mb-2" /><div className="skeleton h-4 w-24 rounded-md" /></div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl mb-2" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Leads</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">{filteredLeads.length} leads</span>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-lg hover:bg-black/5 text-text-secondary transition-colors" aria-label="Toggle filters">
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={fetchLeads} className="p-2 rounded-lg hover:bg-black/5 text-text-secondary transition-colors" aria-label="Refresh leads">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-static relative overflow-hidden"
          >
            <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', card.gradient)} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">{card.label}</span>
                <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', card.gradient, card.glow)}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ... filter & table sections kept structurally identical, just wired to filteredLeads now */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search name, ID, phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all"
                  />
                </div>
                <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all appearance-none">
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Services' : s}</option>)}
                </select>
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all appearance-none">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all appearance-none">
                  <option value="All">All Statuses</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showFilters && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all"
            />
          </div>
        </div>
      )}

      <div className="hidden md:block card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gradient-to-r from-surface-muted/80 to-white/50">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Quote ID</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Package</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Deposit</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <motion.tr
                  key={lead.quoteId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    'border-b border-border/50 last:border-0 transition-all duration-200',
                    idx % 2 === 0 ? 'bg-white' : 'bg-surface-muted/30',
                    'hover:bg-gradient-to-r hover:from-freerock/[0.02] hover:to-transparent'
                  )}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{lead.quoteId}</td>
                  <td className="px-4 py-3.5 font-medium">{lead.name}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{lead.phone}</td>
                  <td className="px-4 py-3.5">{lead.service}</td>
                  <td className="px-4 py-3.5">{lead.tier}</td>
                  <td className="px-4 py-3.5">{lead.location}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm', STATUS_CONFIG[lead.depositStatus].class)}>
                      {lead.depositStatus === 'deposit_paid' && <CheckCircle className="w-3 h-3" />}
                      {lead.depositStatus === 'pending' && <Clock className="w-3 h-3" />}
                      {lead.depositStatus === 'cancelled' && <AlertCircle className="w-3 h-3" />}
                      {lead.depositStatus === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {STATUS_CONFIG[lead.depositStatus].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-secondary">{lead.date}</td>
                  <td className="px-4 py-3.5 text-right relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === lead.quoteId ? null : lead.quoteId)}
                      className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                      aria-label={`Actions for ${lead.name}`}
                      aria-haspopup="true"
                      aria-expanded={openDropdown === lead.quoteId}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {openDropdown === lead.quoteId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1 z-20 w-48"
                          >
                            <div className="bg-white/80 backdrop-blur-2xl rounded-xl shadow-2xl shadow-black/10 border border-white/30 py-1 overflow-hidden">
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-freerock/5 text-left transition-colors"><Eye className="w-4 h-4 text-freerock" /> View Details</button>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-freerock/5 text-left transition-colors"><UserCheck className="w-4 h-4 text-freerock" /> Assign</button>
                              <button onClick={() => { setStatusModal({ open: true, lead }); setOpenDropdown(null) }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-freerock/5 text-left transition-colors"><RefreshCw className="w-4 h-4 text-freerock" /> Update Status</button>
                              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-freerock/5 text-left transition-colors"><MessageSquare className="w-4 h-4 text-freerock" /> Send WhatsApp</button>
                              <hr className="my-1 border-border/50" />
                              <button onClick={() => { setDeleteModal(lead); setOpenDropdown(null) }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-danger/5 text-danger text-left transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-[#1F2937] text-base">No leads yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Leads will appear here when customers request quotes.</p>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filteredLeads.map(lead => (
          <div key={lead.quoteId} className="card-static p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-text-secondary font-mono">{lead.quoteId}</p>
              </div>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', STATUS_CONFIG[lead.depositStatus].class)}>
                {STATUS_CONFIG[lead.depositStatus].label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-text-secondary">Phone:</span> {lead.phone}</div>
              <div><span className="text-text-secondary">Service:</span> {lead.service}</div>
              <div><span className="text-text-secondary">Package:</span> {lead.tier}</div>
              <div><span className="text-text-secondary">Location:</span> {lead.location}</div>
              <div><span className="text-text-secondary">Date:</span> {lead.date}</div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button onClick={() => setStatusModal({ open: true, lead })} className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted transition-colors">Update</button>
              <button onClick={() => setDeleteModal(lead)} className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-danger transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-[#1F2937] text-base">No leads yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Leads will appear here when customers request quotes.</p>
          </div>
        )}
      </div>

      {/* Status update modal */}
      {statusModal.open && statusModal.lead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setStatusModal({ open: false, lead: null })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Update Status"
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Update Status</h3>
              <button onClick={() => setStatusModal({ open: false, lead: null })} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary mb-4">Update deposit status for <strong>{statusModal.lead.name}</strong></p>
            <div className="space-y-2">
              {(['pending', 'deposit_paid', 'completed', 'cancelled'] as DepositStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                    statusModal.lead?.depositStatus === status
                      ? 'border-freerock bg-gradient-to-r from-freerock/10 to-freerock/5 text-freerock shadow-lg shadow-freerock/10'
                      : 'border-border/50 hover:bg-black/5 hover:border-freerock/30'
                  )}
                >
                  {STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Delete Lead"
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-danger">Delete Lead</h3>
              <button onClick={() => setDeleteModal(null)} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary mb-4">Are you sure you want to delete the quote for <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-medium">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

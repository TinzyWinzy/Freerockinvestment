'use client'

import { useState } from 'react'
import { cn } from '../../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, UserPlus, CheckCircle, Clock, Award, Download, Plus, X, Users } from 'lucide-react'

type PaymentStatus = 'paid' | 'pending' | 'partial'

interface Student {
  id: string
  name: string
  phone: string
  paymentStatus: PaymentStatus
  week1: boolean
  week2: boolean
}

interface Intake {
  id: number
  startDate: string
  endDate: string
  capacity: number
  enrolled: number
}

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; class: string }> = {
  paid: { label: 'Paid', class: 'bg-gradient-to-r from-positive/20 to-positive/10 text-positive border border-positive/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]' },
  pending: { label: 'Pending', class: 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border border-warning/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]' },
  partial: { label: 'Partial', class: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]' },
}

const MOCK_STUDENTS: Student[] = [
  { id: 'ENR-0001', name: 'Tatenda Masuku', phone: '+263 77 123 4567', paymentStatus: 'paid', week1: true, week2: true },
  { id: 'ENR-0002', name: 'Sarah Moyo', phone: '+263 71 234 5678', paymentStatus: 'paid', week1: true, week2: false },
  { id: 'ENR-0003', name: 'John Dube', phone: '+263 78 345 6789', paymentStatus: 'pending', week1: false, week2: false },
  { id: 'ENR-0004', name: 'Mary Sibanda', phone: '+263 77 456 7890', paymentStatus: 'partial', week1: true, week2: false },
  { id: 'ENR-0005', name: 'Peter Ndlovu', phone: '+263 71 567 8901', paymentStatus: 'paid', week1: true, week2: true },
  { id: 'ENR-0006', name: 'Grace Nyoni', phone: '+263 78 678 9012', paymentStatus: 'paid', week1: true, week2: true },
  { id: 'ENR-0007', name: 'Blessing Chikwanda', phone: '+263 77 789 0123', paymentStatus: 'pending', week1: false, week2: false },
  { id: 'ENR-0008', name: 'Tafadzwa Gumbo', phone: '+263 71 890 1234', paymentStatus: 'partial', week1: true, week2: false },
]

const MOCK_INTAKES: Intake[] = [
  { id: 1, startDate: '2025-08-01', endDate: '2025-08-14', capacity: 20, enrolled: 8 },
  { id: 2, startDate: '2025-09-05', endDate: '2025-09-18', capacity: 25, enrolled: 0 },
  { id: 3, startDate: '2025-10-03', endDate: '2025-10-16', capacity: 15, enrolled: 0 },
]

const statCards = [
  { label: 'Total Enrolled', icon: Users, gradient: 'from-freerock to-freerock-lime', glow: 'shadow-freerock/25' },
  { label: 'Pending Payment', icon: Clock, gradient: 'from-warning to-orange-500', glow: 'shadow-warning/25' },
  { label: 'Completed', icon: Award, gradient: 'from-positive to-emerald-500', glow: 'shadow-positive/25' },
]

export default function TrainingPage() {
  const [students] = useState(MOCK_STUDENTS)
  const [intakes, setIntakes] = useState(MOCK_INTAKES)
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [newIntake, setNewIntake] = useState({ startDate: '', endDate: '', capacity: 20 })
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalEnrolled = students.length
  const pendingPayment = students.filter(s => s.paymentStatus === 'pending').length
  const completed = students.filter(s => s.week1 && s.week2).length

  const addIntake = () => {
    if (!newIntake.startDate || !newIntake.endDate) return
    setIntakes(prev => [...prev, {
      id: prev.length + 1,
      startDate: newIntake.startDate,
      endDate: newIntake.endDate,
      capacity: newIntake.capacity,
      enrolled: 0,
    }])
    setShowIntakeModal(false)
    setNewIntake({ startDate: '', endDate: '', capacity: 20 })
  }

  const stats = [totalEnrolled, pendingPayment, completed]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Training</h1>
        <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Download className="w-4 h-4" /> Generate Certificates
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              <div className="flex items-center gap-3">
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', card.gradient, card.glow)}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats[i]}</p>
                  <p className="text-xs text-text-secondary font-medium">{card.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-static p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-freerock" /> Intake Dates</h2>
          <button onClick={() => setShowIntakeModal(true)} className="flex items-center gap-1 text-sm text-freerock font-semibold hover:text-freerock-lime transition-colors">
            <Plus className="w-4 h-4" /> Add Intake
          </button>
        </div>
        <div className="space-y-2">
          {intakes.map((intake, i) => {
            const pct = Math.round((intake.enrolled / intake.capacity) * 100)
            return (
              <motion.div
                key={intake.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-surface-muted/80 to-white/50 border border-border/30 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-medium">{intake.startDate} — {intake.endDate}</p>
                  <p className="text-xs text-text-secondary">{intake.enrolled} / {intake.capacity} enrolled</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 h-2.5 rounded-full bg-border/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        pct >= 100 ? 'bg-gradient-to-r from-danger to-red-400' : pct >= 75 ? 'bg-gradient-to-r from-warning to-amber-400' : 'bg-gradient-to-r from-freerock to-freerock-lime'
                      )}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-secondary min-w-[2.5rem] text-right">{pct}%</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="card-static overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4 text-freerock" /> Student Roster</h2>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-xs w-full px-3 py-2 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-gradient-to-r from-surface-muted/80 to-white/50">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Payment</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Week 1</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">Week 2</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    'border-b border-border/50 last:border-0 transition-all duration-200',
                    idx % 2 === 0 ? 'bg-white' : 'bg-surface-muted/30',
                    'hover:bg-gradient-to-r hover:from-freerock/[0.02] hover:to-transparent hover:shadow-sm hover:-translate-y-0.5'
                  )}
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{student.id}</td>
                  <td className="px-4 py-3.5 font-medium">{student.name}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{student.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm', PAYMENT_CONFIG[student.paymentStatus].class)}>
                      {PAYMENT_CONFIG[student.paymentStatus].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {student.week1 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle className="w-5 h-5 text-positive mx-auto drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                      </motion.div>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {student.week2 ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle className="w-5 h-5 text-positive mx-auto drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                      </motion.div>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-[#1F2937] text-base">No students enrolled</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Students will appear here once they enroll in a training intake. Share the training page link to start receiving enrollments.</p>
          </div>
        )}
      </div>

      {showIntakeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowIntakeModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Add Intake</h3>
              <button onClick={() => setShowIntakeModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Start Date</label>
                <input type="date" value={newIntake.startDate} onChange={e => setNewIntake({ ...newIntake, startDate: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">End Date</label>
                <input type="date" value={newIntake.endDate} onChange={e => setNewIntake({ ...newIntake, endDate: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Capacity</label>
                <input type="number" value={newIntake.capacity} onChange={e => setNewIntake({ ...newIntake, capacity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" min={1} />
              </div>
              <button onClick={addIntake} className="btn-primary w-full text-center">Create Intake</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

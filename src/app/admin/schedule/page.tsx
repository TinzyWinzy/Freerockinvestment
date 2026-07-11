'use client'

import { useState, useMemo } from 'react'
import { cn } from '../../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

type EventType = 'install' | 'audit' | 'training' | 'repair'

interface CalendarEvent {
  id: number
  date: string
  title: string
  type: EventType
  time: string
  client: string
}

const EVENT_COLORS: Record<EventType, { bg: string; text: string; dot: string }> = {
  install: { bg: 'bg-positive/10 backdrop-blur-sm', text: 'text-positive', dot: 'bg-positive shadow-[0_0_6px_rgba(34,197,94,0.6)]' },
  audit: { bg: 'bg-blue-500/10 backdrop-blur-sm', text: 'text-blue-600', dot: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]' },
  training: { bg: 'bg-orange-500/10 backdrop-blur-sm', text: 'text-orange-600', dot: 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]' },
  repair: { bg: 'bg-danger/10 backdrop-blur-sm', text: 'text-danger', dot: 'bg-danger shadow-[0_0_6px_rgba(239,68,68,0.6)]' },
}

const EVENT_LABELS: Record<EventType, string> = {
  install: 'Solar Install',
  audit: 'Audit',
  training: 'Training',
  repair: 'Repair',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 1, date: '2025-07-05', title: 'Johnson Residence', type: 'install', time: '08:00', client: 'Tatenda Masuku' },
  { id: 2, date: '2025-07-07', title: 'Moyo Commercial', type: 'audit', time: '10:00', client: 'Sarah Moyo' },
  { id: 3, date: '2025-07-10', title: 'Week 1 Training', type: 'training', time: '09:00', client: 'New Intake' },
  { id: 4, date: '2025-07-12', title: 'Dube Repair', type: 'repair', time: '14:00', client: 'John Dube' },
  { id: 5, date: '2025-07-15', title: 'Sibanda Residence', type: 'install', time: '08:00', client: 'Mary Sibanda' },
  { id: 6, date: '2025-07-18', title: 'Ndlovu Pump Station', type: 'audit', time: '09:30', client: 'Peter Ndlovu' },
  { id: 7, date: '2025-07-20', title: 'Week 2 Training', type: 'training', time: '09:00', client: 'New Intake' },
  { id: 8, date: '2025-07-22', title: 'Nyoni Residence', type: 'install', time: '08:00', client: 'Grace Nyoni' },
  { id: 9, date: '2025-07-25', title: 'Chikwanda Solar', type: 'install', time: '10:00', client: 'Blessing Chikwanda' },
  { id: 10, date: '2025-07-28', title: 'Gumbo Fault', type: 'repair', time: '13:00', client: 'Tafadzwa Gumbo' },
  { id: 11, date: '2025-08-01', title: 'Mukwena Heating', type: 'audit', time: '08:00', client: 'Ruth Mukwena' },
  { id: 12, date: '2025-06-30', title: 'Chitsunge Install', type: 'install', time: '08:00', client: 'Tanaka Chitsunge' },
]

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function SchedulePage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'install' as EventType, client: '' })

  const days = useMemo(() => getMonthDays(year, month), [year, month])
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7))
    return w
  }, [days])

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1); setSelectedDay(null) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1); setSelectedDay(null) }

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = today.getDate()

  const selectedDateStr = selectedDay ? toDateStr(year, month, selectedDay) : null
  const dayEvents = selectedDateStr ? events.filter(e => e.date === selectedDateStr) : []

  const monthEvents = events.filter(e => {
    const [y, m] = e.date.split('-').map(Number)
    return y === year && m === month + 1
  })

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    const evt: CalendarEvent = {
      id: events.length + 1,
      date: newEvent.date,
      title: newEvent.title,
      type: newEvent.type,
      time: newEvent.time || '09:00',
      client: newEvent.client || '—',
    }
    events.push(evt)
    setEvents([...events])
    setShowAddModal(false)
    setNewEvent({ title: '', date: '', time: '', type: 'install', client: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-freerock-dark">Schedule</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-border/50 hover:bg-white hover:shadow-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.h2
          key={`${month}-${year}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold"
        >
          {MONTHS[month]} {year}
        </motion.h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-border/50 hover:bg-white hover:shadow-lg transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['install', 'audit', 'training', 'repair'] as EventType[]).map(t => (
          <span key={t} className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/30 bg-white/60 backdrop-blur-sm shadow-sm', EVENT_COLORS[t].text)}>
            <span className={cn('w-2.5 h-2.5 rounded-full', EVENT_COLORS[t].dot)} />
            {EVENT_LABELS[t]}
          </span>
        ))}
      </div>

      <div className="card-static overflow-hidden">
        <div className="grid grid-cols-7">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-text-secondary py-3 border-b border-border bg-gradient-to-b from-surface-muted/80 to-white/50 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border/50 last:border-0">
            {week.map((day, di) => {
              if (day === null) return <div key={`e-${di}`} className="min-h-28 p-1.5 bg-surface-muted/20" />
              const dateStr = toDateStr(year, month, day)
              const dayEvts = monthEvents.filter(e => e.date === dateStr)
              const isToday = isCurrentMonth && day === todayDate
              const isSelected = selectedDay === day
              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'min-h-28 p-2 text-left border-r border-border/50 last:border-r-0 transition-all relative',
                    isSelected && 'bg-freerock/[0.04]',
                    !isSelected && 'hover:bg-surface-muted/40'
                  )}
                >
                  <span className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                    isToday && 'bg-gradient-to-br from-freerock to-freerock-lime text-white shadow-lg shadow-freerock/30',
                    !isToday && isSelected && 'bg-freerock/10 text-freerock',
                    !isToday && !isSelected && 'text-text-primary'
                  )}>
                    {day}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {dayEvts.slice(0, 2).map(evt => (
                        <div
                          key={evt.id}
                          className={cn(
                            'text-[11px] px-1.5 py-0.5 rounded-md truncate font-medium border border-transparent',
                            EVENT_COLORS[evt.type].bg,
                            EVENT_COLORS[evt.type].text
                          )}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvts.length > 2 && (
                        <span className="text-[10px] text-text-tertiary font-medium">+{dayEvts.length - 2} more</span>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-6 card-static p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Events for {MONTHS[month]} {selectedDay}, {year}</h3>
              <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-lg hover:bg-black/5 text-text-secondary transition-colors"><X className="w-4 h-4" /></button>
            </div>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-text-secondary">No events on this day.</p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map(evt => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all',
                      'border-transparent hover:border-border/50'
                    )}
                  >
                    <span className={cn('w-3 h-3 rounded-full shrink-0', EVENT_COLORS[evt.type].dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{evt.title}</p>
                      <p className="text-xs text-text-secondary">{evt.time} &middot; {evt.client}</p>
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-border/30', EVENT_COLORS[evt.type].text)}>{EVENT_LABELS[evt.type]}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Add Event"
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Add Event</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" placeholder="Event title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1 block">Date</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1 block">Time</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as EventType })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all appearance-none">
                  {(['install', 'audit', 'training', 'repair'] as EventType[]).map(t => (
                    <option key={t} value={t}>{EVENT_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1 block">Client</label>
                <input type="text" value={newEvent.client} onChange={e => setNewEvent({ ...newEvent, client: e.target.value })} className="w-full px-3 py-2.5 border border-border/50 rounded-xl text-sm bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-freerock/20 focus:border-freerock focus:bg-white transition-all" placeholder="Client name" />
              </div>
              <button onClick={addEvent} className="btn-primary w-full text-center">Add Event</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

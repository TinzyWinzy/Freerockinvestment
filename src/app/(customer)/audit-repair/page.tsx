'use client'

import { useState } from 'react'
import { Search, ClipboardCheck, Wrench, DollarSign, type LucideIcon } from 'lucide-react'
import { AUDIT_SERVICES } from '@/lib/constants'
import { formatUSD, cn } from '@/lib/utils'
import { Container } from '@/components/Container'
import { auditBookingSchema } from '@/lib/validations'

const iconMap: Record<string, LucideIcon> = {
  'energy-audit': Search,
  'financial-audit': DollarSign,
  'system-diagnosis': ClipboardCheck,
  'fault-repair': Wrench,
}

export default function AuditRepairPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    serviceId: '',
    date: '',
    location: '',
    phone: '',
  })

  const updateField = (partial: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...partial }))
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(partial).forEach(k => delete next[k])
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = auditBookingSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-freerock/10 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Booking Confirmed</h1>
        <p className="text-sm text-gray-500 mt-2">We&apos;ll reach out within 24 hours to confirm your appointment.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Audit & Repair</h1>
        <p className="text-sm text-white/80 mt-1">Energy audit, fault finding, system diagnosis</p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 py-4 space-y-4"><Container>
        <div>
          <p className="text-xs text-gray-500 mb-2">Select Service</p>
          <div className="space-y-2">
            {AUDIT_SERVICES.map((s) => {
              const Icon = iconMap[s.id] || Wrench
              return (
              <button
                key={s.id}
                type="button"
                onClick={() => updateField({ serviceId: s.id })}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left',
                  form.serviceId === s.id ? 'border-freerock bg-freerock/5' : 'border-gray-200'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-freerock-dark">{s.name}</p>
                  {s.priceUSD && <p className="text-xs text-freerock font-semibold mt-0.5">{formatUSD(s.priceUSD)}</p>}
                  {!s.priceUSD && <p className="text-xs text-gray-400 mt-0.5">Quote required</p>}
                  {'callOutRate' in s && s.callOutRate && <p className="text-xs text-gray-400">+ {formatUSD(s.callOutRate)} call-out fee</p>}
                </div>
              </button>
            )})}
          </div>
          {errors.serviceId && <p className="text-xs text-red-500 mt-1">{errors.serviceId}</p>}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
          <input type="date" value={form.date} onChange={e => updateField({ date: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.date ? 'border-red-400' : 'border-gray-200'}`} required />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Location / Address</p>
          <input value={form.location} onChange={e => updateField({ location: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.location ? 'border-red-400' : 'border-gray-200'}`} placeholder="Enter your address" required />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
          <input type="tel" value={form.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="+263 77 XXX XXXX" required />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <button type="submit" className={cn(
          'w-full rounded-lg py-3 font-semibold text-sm text-white',
          form.serviceId ? 'bg-freerock' : 'bg-gray-300 cursor-not-allowed'
        )} disabled={!form.serviceId}>
          Book Appointment
        </button>
      </Container></form>
    </div>
  )
}

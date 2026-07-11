'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ClipboardCheck, Wrench, DollarSign, Home, type LucideIcon } from 'lucide-react'
import { AUDIT_SERVICES } from '@/lib/constants'
import { formatUSD, cn } from '@/lib/utils'
import { Container } from '@/components/Container'
import { auditBookingSchema } from '@/lib/validations'
import { z } from 'zod'
import { API } from '@/lib/api'

const iconMap: Record<string, LucideIcon> = {
  'energy-audit': Search,
  'financial-audit': DollarSign,
  'system-diagnosis': ClipboardCheck,
  'fault-repair': Wrench,
}

const bookingFormSchema = auditBookingSchema.extend({
  name: z.string().min(2, 'Name required'),
})

export default function AuditRepairPage() {
  const [submitted, setSubmitted] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = bookingFormSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await API.auditRepair.create(result.data)
      if (res.error) {
        setSubmitError(res.error)
        return
      }
      setBookingId(res.booking?.id ?? '')
      setSubmitted(true)
    } catch {
      setSubmitError('Could not reach the server. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-freerock/10 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Booking Confirmed</h1>
        {bookingId && <p className="text-xs text-gray-400 mt-1 font-mono">Reference: {bookingId}</p>}
        <p className="text-sm text-gray-500 mt-2">We&apos;ll reach out within 24 hours to confirm your appointment.</p>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-lg py-3 px-6 font-semibold text-sm">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Audit & Repair</h1>
        <p className="text-sm text-white/80 mt-1">Energy audit, fault finding, system diagnosis</p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 py-4 space-y-4" noValidate><Container>
        <fieldset>
          <legend className="text-xs text-gray-500 mb-2">Select Service</legend>
          <div className="space-y-2">
            {AUDIT_SERVICES.map((s) => {
              const Icon = iconMap[s.id] || Wrench
              const selected = form.serviceId === s.id
              return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => updateField({ serviceId: s.id })}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left',
                  selected ? 'border-freerock bg-freerock/5' : 'border-gray-200'
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
        </fieldset>

        <div>
          <label htmlFor="name" className="text-xs text-gray-500 mb-1 block">Full Name</label>
          <input
            id="name"
            autoComplete="name"
            value={form.name}
            onChange={e => updateField({ name: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && <p id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="date" className="text-xs text-gray-500 mb-1 block">Preferred Date</label>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={e => updateField({ date: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.date ? 'border-red-400' : 'border-gray-200'}`}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && <p id="date-error" className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="location" className="text-xs text-gray-500 mb-1 block">Location / Address</label>
          <input
            id="location"
            autoComplete="street-address"
            value={form.location}
            onChange={e => updateField({ location: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.location ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Enter your address"
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? 'location-error' : undefined}
          />
          {errors.location && <p id="location-error" className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="text-xs text-gray-500 mb-1 block">Phone Number</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={e => updateField({ phone: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="+263 77 XXX XXXX"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && <p id="phone-error" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {submitError && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{submitError}</p>}

        <button type="submit" className={cn(
          'w-full rounded-lg py-3 font-semibold text-sm text-white disabled:opacity-60',
          form.serviceId ? 'bg-freerock' : 'bg-gray-300 cursor-not-allowed'
        )} disabled={!form.serviceId || submitting}>
          {submitting ? 'Booking...' : 'Book Appointment'}
        </button>
      </Container></form>
    </div>
  )
}

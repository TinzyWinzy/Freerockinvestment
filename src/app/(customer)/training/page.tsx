'use client'

import { useState } from 'react'
import { GraduationCap, BookOpen, Calendar, MapPin, DollarSign, Check } from 'lucide-react'
import { TRAINING } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { Container } from '@/components/Container'
import { trainingEnrollmentSchema } from '@/lib/validations'

export default function TrainingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    phone: '',
    idNumber: '',
    education: '',
    emergencyContact: '',
    paymentOption: 'full' as 'full' | 'deposit',
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
    const result = trainingEnrollmentSchema.safeParse(form)
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
          <GraduationCap className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Enrollment Confirmed</h1>
        <p className="text-sm text-gray-500 mt-2">We&apos;ll send course details to your phone within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Solar Training</h1>
        <p className="text-sm text-white/80 mt-1">2-week certified solar installation course</p>
      </header>

      <Container className="py-4 space-y-4">
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-freerock" />
            <span>{TRAINING.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-freerock" />
            <span>{TRAINING.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-freerock">
            <DollarSign className="w-4 h-4" />
            <span>{formatUSD(TRAINING.priceUSD)}</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-freerock-dark flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-freerock" /> Week 1 — Foundation
          </h3>
          <ul className="space-y-1">
            {TRAINING.curriculum.week1.map((t) => (
              <li key={t} className="text-sm text-gray-600 flex items-center gap-2"><Check className="w-3.5 h-3.5 text-freerock-lime shrink-0" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-freerock-dark flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-freerock" /> Week 2 — Installation
          </h3>
          <ul className="space-y-1">
            {TRAINING.curriculum.week2.map((t) => (
              <li key={t} className="text-sm text-gray-600 flex items-center gap-2"><Check className="w-3.5 h-3.5 text-freerock-lime shrink-0" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-freerock-dark mb-2">Requirements</h3>
          <ul className="space-y-1">
            {TRAINING.requirements.map((r) => (
              <li key={r} className="text-sm text-gray-600 flex items-center gap-2"><Check className="w-3.5 h-3.5 text-freerock-lime shrink-0" />{r}</li>
            ))}
          </ul>
        </div>
      </Container>

      <Container>
        <form onSubmit={handleSubmit} className="pb-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Full Name</p>
          <input value={form.name} onChange={e => updateField({ name: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`} required />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
          <input type="tel" value={form.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} required />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">National ID / Passport</p>
          <input value={form.idNumber} onChange={e => updateField({ idNumber: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.idNumber ? 'border-red-400' : 'border-gray-200'}`} required />
          {errors.idNumber && <p className="text-xs text-red-500 mt-1">{errors.idNumber}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Education Background</p>
          <input value={form.education} onChange={e => updateField({ education: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" placeholder="e.g. O-Level, Diploma, Degree" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
          <input value={form.emergencyContact} onChange={e => updateField({ emergencyContact: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.emergencyContact ? 'border-red-400' : 'border-gray-200'}`} placeholder="Name & phone number" />
          {errors.emergencyContact && <p className="text-xs text-red-500 mt-1">{errors.emergencyContact}</p>}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer">
            <input type="radio" name="payment" className="accent-freerock" checked={form.paymentOption === 'full'} onChange={() => updateField({ paymentOption: 'full' })} />
            <span className="text-sm text-freerock-dark">Pay Full: {formatUSD(TRAINING.priceUSD)}</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer">
            <input type="radio" name="payment" className="accent-freerock" checked={form.paymentOption === 'deposit'} onChange={() => updateField({ paymentOption: 'deposit' })} />
            <span className="text-sm text-freerock-dark">Deposit: {formatUSD(TRAINING.priceUSD * 0.5)}</span>
          </label>
        </div>
        {errors.paymentOption && <p className="text-xs text-red-500">{errors.paymentOption}</p>}
        <button type="submit" className="w-full bg-freerock text-white rounded-lg py-3 font-semibold text-sm">
          Enroll Now
        </button>
      </form>
      </Container>
    </div>
  )
}

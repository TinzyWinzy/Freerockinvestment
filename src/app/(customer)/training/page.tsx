'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, BookOpen, Calendar, MapPin, DollarSign, Check, MessageCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { TRAINING } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { Container } from '@/components/Container'
import { trainingEnrollmentSchema } from '@/lib/validations'
import { getWhatsAppLink, trainingEnrolledMessage } from '@/lib/whatsapp'
import { API } from '@/lib/api'

interface Intake {
  id: string
  startDate: string
  endDate: string
  spotsAvailable: number
}

export default function TrainingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [enrollmentId, setEnrollmentId] = useState('')
  const [intakeDate, setIntakeDate] = useState('')
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [intakeId, setIntakeId] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    idNumber: '',
    education: '',
    emergencyContact: '',
    paymentOption: 'full' as 'full' | 'deposit',
  })

  useEffect(() => {
    API.training.intakes().then((res) => {
      if (res.intakes?.length) {
        setIntakes(res.intakes)
        setIntakeId(res.intakes[0].id)
      }
    }).catch(() => { /* form still works — intakeId falls back to earliest computed date below */ })
  }, [])

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
    const result = trainingEnrollmentSchema.safeParse(form)
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
      const selectedIntake = intakes.find((i) => i.id === intakeId)
      const res = await API.training.enroll({
        fullName: result.data.name,
        phone: result.data.phone,
        email: `${result.data.phone.replace(/\D/g, '')}@placeholder.freerock.co.zw`,
        intakeId: intakeId || 'intake-1',
        isLiterate: true,
        hasElectricalBackground: !!result.data.education,
        notes: `ID: ${result.data.idNumber}. Emergency contact: ${result.data.emergencyContact}. Payment: ${result.data.paymentOption}.`,
      })
      if (res.error) {
        setSubmitError(res.error)
        return
      }
      setEnrollmentId(res.enrollment?.id ?? '')
      setIntakeDate(
        selectedIntake
          ? new Date(selectedIntake.startDate).toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          : new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      )
      setSubmitted(true)
    } catch {
      setSubmitError('Could not reach the server. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappLink = submitted
    ? getWhatsAppLink(trainingEnrolledMessage({ name: form.name, enrollmentId, intakeDate }))
    : ''

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-freerock/10 flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Enrollment Confirmed</h1>
        {enrollmentId && <p className="text-xs text-gray-400 mt-1 font-mono">Enrollment ID: {enrollmentId}</p>}
        <p className="text-sm text-gray-500 mt-2">We&apos;ll send course details to your phone within 24 hours.</p>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-lg py-3 px-6 font-semibold text-sm">
          <MessageCircle className="w-4 h-4 text-green-500" /> Share on WhatsApp
        </a>
        <Link href="/" className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
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

        {intakes.length > 0 && (
          <div>
            <label htmlFor="intake" className="text-xs text-gray-500 mb-1 block">Choose Intake</label>
            <select id="intake" value={intakeId} onChange={e => setIntakeId(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-sm">
              {intakes.map((i) => (
                <option key={i.id} value={i.id}>
                  {new Date(i.startDate).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric', year: 'numeric' })} — {i.spotsAvailable} spots left
                </option>
              ))}
            </select>
          </div>
        )}

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
        <form onSubmit={handleSubmit} className="pb-6 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="text-xs text-gray-500 mb-1 block">Full Name</label>
          <input id="name" autoComplete="name" value={form.name} onChange={e => updateField({ name: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
          {errors.name && <p id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="text-xs text-gray-500 mb-1 block">Phone Number</label>
          <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="+263 77 XXX XXXX" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
          {errors.phone && <p id="phone-error" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="idNumber" className="text-xs text-gray-500 mb-1 block">National ID / Passport</label>
          <input id="idNumber" value={form.idNumber} onChange={e => updateField({ idNumber: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.idNumber ? 'border-red-400' : 'border-gray-200'}`} aria-invalid={!!errors.idNumber} aria-describedby={errors.idNumber ? 'idNumber-error' : undefined} />
          {errors.idNumber && <p id="idNumber-error" className="text-xs text-red-500 mt-1">{errors.idNumber}</p>}
        </div>
        <div>
          <label htmlFor="education" className="text-xs text-gray-500 mb-1 block">Education Background</label>
          <input id="education" value={form.education} onChange={e => updateField({ education: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" placeholder="e.g. O-Level, Diploma, Degree" />
        </div>
        <div>
          <label htmlFor="emergencyContact" className="text-xs text-gray-500 mb-1 block">Emergency Contact</label>
          <input id="emergencyContact" value={form.emergencyContact} onChange={e => updateField({ emergencyContact: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.emergencyContact ? 'border-red-400' : 'border-gray-200'}`} placeholder="Name & phone number" aria-invalid={!!errors.emergencyContact} aria-describedby={errors.emergencyContact ? 'emergencyContact-error' : undefined} />
          {errors.emergencyContact && <p id="emergencyContact-error" className="text-xs text-red-500 mt-1">{errors.emergencyContact}</p>}
        </div>
        <fieldset className="flex gap-2">
          <legend className="sr-only">Payment option</legend>
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer">
            <input type="radio" name="payment" className="accent-freerock" checked={form.paymentOption === 'full'} onChange={() => updateField({ paymentOption: 'full' })} />
            <span className="text-sm text-freerock-dark">Pay Full: {formatUSD(TRAINING.priceUSD)}</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer">
            <input type="radio" name="payment" className="accent-freerock" checked={form.paymentOption === 'deposit'} onChange={() => updateField({ paymentOption: 'deposit' })} />
            <span className="text-sm text-freerock-dark">Deposit: {formatUSD(TRAINING.priceUSD * 0.5)}</span>
          </label>
        </fieldset>
        {errors.paymentOption && <p className="text-xs text-red-500">{errors.paymentOption}</p>}
        {submitError && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{submitError}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-freerock text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-60">
          {submitting ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </form>
      </Container>
    </div>
  )
}

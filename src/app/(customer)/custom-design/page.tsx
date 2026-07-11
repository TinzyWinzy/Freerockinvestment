'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Ruler, Upload, Eye, Home } from 'lucide-react'
import { Container } from '@/components/Container'
import { customDesignSchema } from '@/lib/validations'
import { API } from '@/lib/api'

export default function CustomDesignPage() {
  const [submitted, setSubmitted] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    propertySize: '',
    energyUsage: '',
    budget: 500,
    need3D: false,
    needFinancialAnalysis: false,
    name: '',
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
    const result = customDesignSchema.safeParse(form)
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
      const res = await API.customDesign.create(result.data)
      if (res.error) {
        setSubmitError(res.error)
        return
      }
      setRequestId(res.request?.id ?? '')
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
          <Ruler className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Thank You!</h1>
        {requestId && <p className="text-xs text-gray-400 mt-1 font-mono">Reference: {requestId}</p>}
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Our design team will contact you within 24 hours.
        </p>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 rounded-lg py-3 px-6 font-semibold text-sm">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Custom Solar Design</h1>
        <p className="text-sm text-white/80 mt-1">3D visualization & annual energy simulation</p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 py-4 space-y-4" noValidate><Container>
        <div>
          <label htmlFor="propertySize" className="text-xs text-gray-500 mb-1 block">Property Size (sqm)</label>
          <input
            id="propertySize"
            type="number"
            inputMode="numeric"
            value={form.propertySize}
            onChange={e => updateField({ propertySize: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.propertySize ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="e.g. 250"
            aria-invalid={!!errors.propertySize}
            aria-describedby={errors.propertySize ? 'propertySize-error' : undefined}
          />
          {errors.propertySize && <p id="propertySize-error" className="text-xs text-red-500 mt-1">{errors.propertySize}</p>}
        </div>
        <div>
          <label htmlFor="energyUsage" className="text-xs text-gray-500 mb-1 block">Current Monthly Energy Usage (kWh)</label>
          <input
            id="energyUsage"
            type="number"
            inputMode="numeric"
            value={form.energyUsage}
            onChange={e => updateField({ energyUsage: e.target.value })}
            className={`w-full p-3 rounded-xl border text-sm ${errors.energyUsage ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="e.g. 600"
            aria-invalid={!!errors.energyUsage}
            aria-describedby={errors.energyUsage ? 'energyUsage-error' : undefined}
          />
          {errors.energyUsage && <p id="energyUsage-error" className="text-xs text-red-500 mt-1">{errors.energyUsage}</p>}
        </div>
        <div>
          <label htmlFor="budget" className="text-xs text-gray-500 mb-1 block">Budget Range (USD)</label>
          <input id="budget" type="range" min={500} max={20000} step={500} value={form.budget} onChange={e => updateField({ budget: Number(e.target.value) })} className="w-full accent-freerock" aria-valuetext={`$${form.budget}`} />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>$500</span>
            <span>${form.budget}</span>
          </div>
          {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
        </div>
        <div>
          <span className="text-xs text-gray-500 mb-1 block">Upload Property Photos <span className="text-gray-400">(optional)</span></span>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Tap to upload images</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={() => { /* accepted for future review; not required to submit a request */ }} />
          </label>
        </div>
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
          <input type="checkbox" checked={form.need3D} onChange={e => updateField({ need3D: e.target.checked })} className="w-4 h-4 accent-freerock" />
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-freerock" />
            <span className="text-sm text-freerock-dark">I want 3D visualization</span>
          </div>
        </label>
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
          <input type="checkbox" checked={form.needFinancialAnalysis} onChange={e => updateField({ needFinancialAnalysis: e.target.checked })} className="w-4 h-4 accent-freerock" />
          <span className="text-sm text-freerock-dark">I want a financial / ROI analysis</span>
        </label>
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
        <button type="submit" disabled={submitting} className="w-full bg-freerock text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-60">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </Container></form>
    </div>
  )
}

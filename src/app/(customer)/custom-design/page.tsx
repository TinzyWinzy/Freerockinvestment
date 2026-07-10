'use client'

import { useState } from 'react'
import { Ruler, Upload, Eye } from 'lucide-react'
import { Container } from '@/components/Container'
import { customDesignSchema } from '@/lib/validations'

export default function CustomDesignPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  const handleSubmit = (e: React.FormEvent) => {
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
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-freerock/10 flex items-center justify-center mb-4">
          <Ruler className="w-8 h-8 text-freerock" />
        </div>
        <h1 className="text-xl font-bold text-freerock-dark">Thank You!</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Our design team will contact you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Custom Solar Design</h1>
        <p className="text-sm text-white/80 mt-1">3D visualization & annual energy simulation</p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 py-4 space-y-4"><Container>
        <div>
          <p className="text-xs text-gray-500 mb-1">Property Size (sqm)</p>
          <input type="number" value={form.propertySize} onChange={e => updateField({ propertySize: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.propertySize ? 'border-red-400' : 'border-gray-200'}`} placeholder="e.g. 250" required />
          {errors.propertySize && <p className="text-xs text-red-500 mt-1">{errors.propertySize}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Current Monthly Energy Usage (kWh)</p>
          <input type="number" value={form.energyUsage} onChange={e => updateField({ energyUsage: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.energyUsage ? 'border-red-400' : 'border-gray-200'}`} placeholder="e.g. 600" required />
          {errors.energyUsage && <p className="text-xs text-red-500 mt-1">{errors.energyUsage}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Budget Range (USD)</p>
          <input type="range" min={500} max={20000} step={500} value={form.budget} onChange={e => updateField({ budget: Number(e.target.value) })} className="w-full accent-freerock" />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>$500</span>
            <span>${form.budget}</span>
          </div>
          {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Upload Property Photos</p>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Tap to upload images</span>
            <input type="file" multiple accept="image/*" className="hidden" />
          </label>
        </div>
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
          <input type="checkbox" checked={form.need3D} onChange={e => updateField({ need3D: e.target.checked })} className="w-4 h-4 accent-freerock" />
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-freerock" />
            <span className="text-sm text-freerock-dark">I want 3D visualization</span>
          </div>
        </label>
        {errors.need3D && <p className="text-xs text-red-500">{errors.need3D}</p>}
        <div>
          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
          <input type="tel" value={form.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="+263 77 XXX XXXX" required />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <button type="submit" className="w-full bg-freerock text-white rounded-lg py-3 font-semibold text-sm">
          Submit Request
        </button>
      </Container></form>
    </div>
  )
}

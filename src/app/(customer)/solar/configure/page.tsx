'use client'

import { useState, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { SOLAR_PACKAGES, ROOF_TYPES, PROPERTY_TYPES, PROVINCES, TV_BUNDLE_PRICES } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { calculateSolarPricing } from '@/lib/pricing'
import { ArrowLeft, Check } from 'lucide-react'
import { Container } from '@/components/Container'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { wizardStep1Schema, wizardStep2Schema, wizardStep4Schema } from '@/lib/validations'
import { API } from '@/lib/api'
import { queueOfflineSubmission } from '@/lib/offline-sync'

const citiesByProvince: Record<string, string[]> = {
  Harare: ['Harare', 'Chitungwiza', 'Epworth', 'Norton'],
  Bulawayo: ['Bulawayo'],
  Manicaland: ['Mutare', 'Rusape', 'Chipinge'],
  'Mashonaland Central': ['Bindura', 'Shamva', 'Mazowe'],
  'Mashonaland East': ['Marondera', 'Ruwa', 'Goromonzi'],
  'Mashonaland West': ['Chinhoyi', 'Karoi', 'Kariba', 'Norton'],
  Masvingo: ['Masvingo', 'Chiredzi'],
  'Matabeleland North': ['Victoria Falls', 'Hwange', 'Lupane'],
  'Matabeleland South': ['Gwanda', 'Beitbridge', 'Plumtree'],
  Midlands: ['Gweru', 'Kwekwe', 'Zvishavane', 'Redcliff'],
}

const steps = ['Package', 'Roof & Property', 'Location & Access', 'Current Setup', 'Contact']

function WizardContent() {
  const router = useRouter()
  const { wizard, setWizard } = useStore()
  const [step, setStep] = useState(wizard.step || 0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const pkg = SOLAR_PACKAGES.find(p => p.id === wizard.packageId)
  const cities = wizard.province ? citiesByProvince[wizard.province] || [] : []

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 7)
  const minDateStr = minDate.toISOString().split('T')[0]

  const updateField = (partial: Partial<typeof wizard>) => {
    setWizard(partial)
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(partial).forEach(k => delete next[k])
      return next
    })
  }

  const validateStep = (stepIndex: number): boolean => {
    setErrors({})
    let result
    switch (stepIndex) {
      case 1:
        result = wizardStep1Schema.safeParse(wizard)
        break
      case 2:
        result = wizardStep2Schema.safeParse(wizard)
        break
      case 4:
        result = wizardStep4Schema.safeParse({ ...wizard, terms: termsAccepted })
        break
      default:
        return true
    }
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep(s => s + 1)
    setWizard({ step: step + 1 })
  }

  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1)
      setWizard({ step: step - 1 })
    }
  }

  const handleGenerateQuote = async () => {
    if (!validateStep(4)) return
    setSubmitError('')
    setSubmitting(true)

    const payload = {
      fullName: wizard.name,
      email: wizard.email || '',
      phone: wizard.phone,
      province: wizard.province,
      propertyType: wizard.propertyType,
      roofType: wizard.roofType,
      serviceId: wizard.packageId,
      payAfterInstall: wizard.payAfterInstall,
      addons: { tvBundle: wizard.tvBundle },
      notes: `City: ${wizard.city}; Suburb: ${wizard.suburb}; Phases: ${wizard.phases}; Truck access: ${wizard.truckAccess ? 'yes' : 'no'}; Install date: ${wizard.installDate}; Monthly bill: $${wizard.monthlyBill}${wizard.photoUrl ? `; Photo: ${wizard.photoUrl}` : ''}`,
    }

    try {
      const res = await API.quote.create(payload)
      if (res.error) {
        setSubmitError(res.error)
        setSubmitting(false)
        return
      }
      try { localStorage.setItem(`quote-${res.quote.id}`, JSON.stringify(res.quote)) } catch { }
      useStore.getState().addOfflineQuote(res.quote.id)
      router.push(`/solar/quote/${res.quote.id}`)
    } catch {
      // Offline / network failure — build the same canonical quote object
      // locally so the customer never loses their place, and queue it for
      // background sync once connectivity returns.
      const pricing = calculateSolarPricing(wizard.packageId, { tvBundle: wizard.tvBundle })
      if (!pricing || !pkg) {
        setSubmitError('Could not generate your quote. Please check your connection and try again.')
        setSubmitting(false)
        return
      }
      const id = `FRQ-OFFLINE-${Date.now().toString().slice(-6)}`
      const quote = {
        id,
        customer: { fullName: wizard.name, email: wizard.email, phone: wizard.phone, province: wizard.province, propertyType: wizard.propertyType, roofType: wizard.roofType },
        serviceId: wizard.packageId,
        serviceName: pkg.name,
        pricing,
        addons: { tvBundle: wizard.tvBundle },
        payAfterInstall: wizard.payAfterInstall,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        notes: payload.notes,
      }
      try { localStorage.setItem(`quote-${id}`, JSON.stringify(quote)) } catch { }
      useStore.getState().addOfflineQuote(id)
      try { await queueOfflineSubmission(payload) } catch { }
      router.push(`/solar/quote/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <p className="text-gray-500">Please select a solar package first.</p>
        <button onClick={() => router.push('/solar')} className="mt-4 btn-primary text-sm">Browse Packages</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh pb-6">
      <header className="px-4 pt-6 pb-2 flex items-center gap-3">
        {step > 0 && (
          <button onClick={goBack} className="touch-target flex items-center justify-center" aria-label="Go back to previous step">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-lg font-bold text-[#1F2937]">Configure Your System</h1>
      </header>

      <div className="px-4 py-2 flex flex-col items-center gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label="Wizard progress">
        <div className="flex gap-1.5 justify-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= step ? 'bg-[#228B22] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-[#228B22]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-[#228B22]">Step {step + 1} of {steps.length}: {steps[step]}</p>
      </div>

      <Container className="flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Confirm Package</h2>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#1F2937]">{pkg.name}</p>
                  <p className="text-sm text-gray-500">{pkg.specs.inverter}</p>
                </div>
                <span className="text-lg font-bold text-[#228B22]">{formatUSD(pkg.priceUSD)}</span>
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={wizard.tvBundle} onChange={e => updateField({ tvBundle: e.target.checked })} className="w-4 h-4 accent-[#228B22]" />
              <div>
                <p className="text-sm font-medium text-[#1F2937]">Add TV Bundle</p>
                <p className="text-xs text-gray-500">{formatUSD(TV_BUNDLE_PRICES[pkg.id] || 0)} extra</p>
              </div>
            </label>
            <button onClick={goNext} className="w-full btn-primary">Continue</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Roof & Property</h2>
            <fieldset>
              <legend className="text-xs text-gray-500 mb-2">Roof Type</legend>
              <div className="grid grid-cols-2 gap-2">
                {ROOF_TYPES.map(r => (
                  <button key={r.id} type="button" aria-pressed={wizard.roofType === r.id} onClick={() => updateField({ roofType: r.id })} className={`p-3 rounded-xl border text-sm text-center font-medium ${wizard.roofType === r.id ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22]' : 'border-gray-200 text-gray-600'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
              {errors.roofType && <p className="text-xs text-red-500 mt-1">{errors.roofType}</p>}
            </fieldset>
            <fieldset>
              <legend className="text-xs text-gray-500 mb-2">Property Type</legend>
              <div className="flex gap-2">
                {PROPERTY_TYPES.map(p => (
                  <button key={p.id} type="button" aria-pressed={wizard.propertyType === p.id} onClick={() => updateField({ propertyType: p.id })} className={`flex-1 p-3 rounded-xl border text-sm text-center font-medium ${wizard.propertyType === p.id ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22]' : 'border-gray-200 text-gray-600'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              {errors.propertyType && <p className="text-xs text-red-500 mt-1">{errors.propertyType}</p>}
            </fieldset>
            <fieldset>
              <legend className="text-xs text-gray-500 mb-2">Phases</legend>
              <div className="flex gap-2">
                {['single', 'three'].map(p => (
                  <button key={p} type="button" aria-pressed={wizard.phases === p} onClick={() => updateField({ phases: p })} className={`flex-1 p-3 rounded-xl border text-sm text-center font-medium capitalize ${wizard.phases === p ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22]' : 'border-gray-200 text-gray-600'}`}>
                    {p} Phase
                  </button>
                ))}
              </div>
              {errors.phases && <p className="text-xs text-red-500 mt-1">{errors.phases}</p>}
            </fieldset>
            <button onClick={goNext} className="w-full btn-primary">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Location & Access</h2>
            <div>
              <label htmlFor="province" className="text-xs text-gray-500 mb-1 block">Province</label>
              <select id="province" value={wizard.province} onChange={e => { updateField({ province: e.target.value, city: '' }) }} className="w-full p-3 rounded-xl border border-gray-200 text-sm" aria-invalid={!!errors.province} aria-describedby={errors.province ? 'province-error' : undefined}>
                <option value="">Select province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p id="province-error" className="text-xs text-red-500 mt-1">{errors.province}</p>}
            </div>
            {wizard.province && (
              <div>
                <label htmlFor="city" className="text-xs text-gray-500 mb-1 block">City / Town</label>
                <select id="city" value={wizard.city} onChange={e => updateField({ city: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-error' : undefined}>
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p id="city-error" className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            )}
            <div>
              <label htmlFor="suburb" className="text-xs text-gray-500 mb-1 block">Suburb</label>
              <input id="suburb" autoComplete="address-level3" value={wizard.suburb} onChange={e => updateField({ suburb: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" placeholder="Enter suburb" aria-invalid={!!errors.suburb} aria-describedby={errors.suburb ? 'suburb-error' : undefined} />
              {errors.suburb && <p id="suburb-error" className="text-xs text-red-500 mt-1">{errors.suburb}</p>}
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={wizard.truckAccess} onChange={e => updateField({ truckAccess: e.target.checked })} className="w-4 h-4 accent-[#228B22]" />
              <span className="text-sm text-[#1F2937]">Truck access available</span>
            </label>
            <div>
              <label htmlFor="installDate" className="text-xs text-gray-500 mb-1 block">Preferred installation date</label>
              <input id="installDate" type="date" value={wizard.installDate} min={minDateStr} onChange={e => updateField({ installDate: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" aria-invalid={!!errors.installDate} aria-describedby={errors.installDate ? 'installDate-error' : undefined} />
              {errors.installDate && <p id="installDate-error" className="text-xs text-red-500 mt-1">{errors.installDate}</p>}
            </div>
            <button onClick={goNext} className="w-full btn-primary">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Current Setup <span className="text-xs text-gray-400 font-normal">(Optional)</span></h2>
            <label htmlFor="monthlyBill" className="text-xs text-gray-500 block">Monthly ZESA bill estimate (USD)</label>
            <input id="monthlyBill" type="range" min={50} max={1000} step={50} value={wizard.monthlyBill} className="w-full accent-[#228B22]" onChange={e => updateField({ monthlyBill: Number(e.target.value) })} aria-valuetext={`$${wizard.monthlyBill}`} />
            <p className="text-sm text-center font-medium text-[#1F2937]">${wizard.monthlyBill}</p>
            <span className="text-xs text-gray-500 block">Upload a photo of your current setup</span>
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload a photo of your current setup"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
              className={`relative block p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#228B22] ${photoPreview ? 'border-[#228B22] bg-[#228B22]/5' : photoError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              {photoPreview ? (
                <div className="space-y-2">
                  <img src={photoPreview} alt="Selected setup preview" className="mx-auto max-h-40 rounded-lg object-cover" />
                  <p className="text-xs text-gray-500 truncate">{photo?.name} ({(photo!.size / 1024).toFixed(1)} KB)</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); setPhotoError('') }} className="text-xs text-red-500 underline">Remove</button>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Tap to upload photo</span>
                  {photoError && <p className="text-xs text-red-500">{photoError}</p>}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setPhotoError('')
                  if (!file) return
                  const allowed = ['image/jpeg', 'image/png', 'image/webp']
                  if (!allowed.includes(file.type)) {
                    setPhotoError('Invalid file type. Use JPEG, PNG or WebP.')
                    return
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    setPhotoError('File too large. Max 5MB.')
                    return
                  }
                  setPhoto(file)
                  setPhotoPreview(URL.createObjectURL(file))
                }}
              />
            </div>
            {uploading && <p className="text-xs text-center text-gray-400">Uploading...</p>}
            <button onClick={async () => {
              if (photo) {
                setUploading(true)
                try {
                  const formData = new FormData()
                  formData.append('file', photo)
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  const data = await res.json()
                  if (!res.ok) { setPhotoError(data.error); return }
                  updateField({ photoUrl: data.url })
                } catch { setPhotoError('Upload failed') }
                finally { setUploading(false) }
              }
              goNext()
            }} className="w-full btn-primary">{photo ? 'Upload & Continue' : 'Skip & Continue'}</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Contact Details</h2>
            <div>
              <label htmlFor="name" className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input id="name" autoComplete="name" value={wizard.name} onChange={e => updateField({ name: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`} placeholder="John Doe" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <p id="name-error" className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input id="phone" type="tel" autoComplete="tel" value={wizard.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="+263 77 XXX XXXX" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
              {errors.phone && <p id="phone-error" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-xs text-gray-500 mb-1 block">Email <span className="text-gray-400">(optional)</span></label>
              <input id="email" type="email" autoComplete="email" value={wizard.email} onChange={e => updateField({ email: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.email ? 'border-red-400' : 'border-gray-200'}`} placeholder="john@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
              {errors.email && <p id="email-error" className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={wizard.payAfterInstall} onChange={e => updateField({ payAfterInstall: e.target.checked })} className="w-4 h-4 accent-[#228B22]" />
              <span className="text-sm text-[#1F2937]">Pay After Installation</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={termsAccepted} onChange={e => { setTermsAccepted(e.target.checked); setErrors(prev => { const n = { ...prev }; delete n.terms; return n }) }} className="w-4 h-4 accent-[#228B22]" aria-invalid={!!errors.terms} aria-describedby={errors.terms ? 'terms-error' : undefined} />
              <span className="text-xs text-gray-500">I agree to the terms & conditions</span>
            </label>
            {errors.terms && <p id="terms-error" className="text-xs text-red-500">{errors.terms}</p>}
            {submitError && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{submitError}</p>}
            <button onClick={handleGenerateQuote} disabled={submitting} className="w-full btn-primary disabled:opacity-60">{submitting ? 'Generating...' : 'Generate Quote'}</button>
          </div>
        )}
      </Container>
    </div>
  )
}

function ConfigurePageContent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 min-h-dvh"><div className="skeleton w-8 h-8 rounded-full" /></div>}>
      <WizardContent />
    </Suspense>
  )
}

export default function ConfigurePage() {
  return (
    <ErrorBoundary>
      <ConfigurePageContent />
    </ErrorBoundary>
  )
}

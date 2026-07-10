'use client'

import { useState, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { SOLAR_PACKAGES, ROOF_TYPES, PROPERTY_TYPES, PROVINCES, TV_BUNDLE_PRICES } from '@/lib/constants'
import { formatUSD, generateQuoteId } from '@/lib/utils'
import { ArrowLeft, Check } from 'lucide-react'
import { Container } from '@/components/Container'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { contactSchema, wizardStep1Schema, wizardStep2Schema } from '@/lib/validations'

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
        result = contactSchema.safeParse(wizard)
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

  const handleGenerateQuote = () => {
    if (!validateStep(4)) return
    const id = generateQuoteId()
    const data = { id, package: pkg, ...wizard, createdAt: new Date().toISOString() }
    try { localStorage.setItem(`quote-${id}`, JSON.stringify(data)) } catch { }
    useStore.getState().addOfflineQuote(id)
    router.push(`/solar/quote/${id}`)
  }

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-dvh px-4 text-center">
        <p className="text-gray-500">Please select a solar package first.</p>
        <button onClick={() => router.push('/solar')} className="mt-4 bg-[#228B22] text-white rounded-lg px-6 py-2 text-sm font-semibold">Browse Packages</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh pb-6">
      <header className="px-4 pt-6 pb-2 flex items-center gap-3">
        {step > 0 && (
          <button onClick={goBack} className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-lg font-bold text-[#1F2937]">Configure Your System</h1>
      </header>

      <div className="px-4 py-2 flex gap-1.5 justify-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= step ? 'bg-[#228B22] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-[#228B22]' : 'bg-gray-200'}`} />}
          </div>
        ))}
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
            <button onClick={goNext} className="w-full bg-[#228B22] text-white rounded-lg py-3 font-semibold">Continue</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Roof & Property</h2>
            <p className="text-xs text-gray-500">Roof Type</p>
            <div className="grid grid-cols-2 gap-2">
              {ROOF_TYPES.map(r => (
                <button key={r.id} onClick={() => updateField({ roofType: r.id })} className={`p-3 rounded-xl border text-sm text-center font-medium ${wizard.roofType === r.id ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22]' : 'border-gray-200 text-gray-600'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            {errors.roofType && <p className="text-xs text-red-500">{errors.roofType}</p>}
            <p className="text-xs text-gray-500">Property Type</p>
            <div className="flex gap-2">
              {PROPERTY_TYPES.map(p => (
                <button key={p.id} onClick={() => updateField({ propertyType: p.id })} className={`flex-1 p-3 rounded-xl border text-sm text-center font-medium ${wizard.propertyType === p.id ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22]' : 'border-gray-200 text-gray-600'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType}</p>}
            <p className="text-xs text-gray-500">Phases</p>
            <div className="flex gap-2">
              {['single', 'three'].map(p => (
                <button key={p} onClick={() => updateField({ phases: p })} className={`flex-1 p-3 rounded-xl border text-sm text-center font-medium ${wizard.phases === p ? 'border-[#228B22] bg-[#228B22]/5 text-[#228B22] capitalize' : 'border-gray-200 text-gray-600 capitalize'}`}>
                  {p} Phase
                </button>
              ))}
            </div>
            {errors.phases && <p className="text-xs text-red-500">{errors.phases}</p>}
            <button onClick={goNext} className="w-full bg-[#228B22] text-white rounded-lg py-3 font-semibold">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Location & Access</h2>
            <div>
              <p className="text-xs text-gray-500 mb-1">Province</p>
              <select value={wizard.province} onChange={e => { updateField({ province: e.target.value, city: '' }) }} className="w-full p-3 rounded-xl border border-gray-200 text-sm">
                <option value="">Select province</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
            </div>
            {wizard.province && (
              <div>
                <p className="text-xs text-gray-500 mb-1">City / Town</p>
                <select value={wizard.city} onChange={e => updateField({ city: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm">
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Suburb</p>
              <input value={wizard.suburb} onChange={e => updateField({ suburb: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" placeholder="Enter suburb" />
              {errors.suburb && <p className="text-xs text-red-500 mt-1">{errors.suburb}</p>}
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={wizard.truckAccess} onChange={e => updateField({ truckAccess: e.target.checked })} className="w-4 h-4 accent-[#228B22]" />
              <span className="text-sm text-[#1F2937]">Truck access available</span>
            </label>
            <div>
              <p className="text-xs text-gray-500 mb-1">Preferred installation date</p>
              <input type="date" value={wizard.installDate} min={minDateStr} onChange={e => updateField({ installDate: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 text-sm" />
              {errors.installDate && <p className="text-xs text-red-500 mt-1">{errors.installDate}</p>}
            </div>
            <button onClick={goNext} className="w-full bg-[#228B22] text-white rounded-lg py-3 font-semibold">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Current Setup <span className="text-xs text-gray-400 font-normal">(Optional)</span></h2>
            <p className="text-xs text-gray-500">Monthly ZESA bill estimate (USD)</p>
            <input type="range" min={50} max={1000} step={50} className="w-full accent-[#228B22]" onChange={e => updateField({ monthlyBill: Number(e.target.value) })} />
            <p className="text-sm text-center font-medium text-[#1F2937]">${wizard.monthlyBill}</p>
            <p className="text-xs text-gray-500">Upload a photo of your current setup</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative block p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${photoPreview ? 'border-[#228B22] bg-[#228B22]/5' : photoError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            >
              {photoPreview ? (
                <div className="space-y-2">
                  <img src={photoPreview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-cover" />
                  <p className="text-xs text-gray-500 truncate">{photo?.name} ({(photo!.size / 1024).toFixed(1)} KB)</p>
                  <button onClick={(e) => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); setPhotoError('') }} className="text-xs text-red-500 underline">Remove</button>
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
            }} className="w-full bg-[#228B22] text-white rounded-lg py-3 font-semibold">{photo ? 'Upload & Continue' : 'Skip & Continue'}</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[#1F2937]">Contact Details</h2>
            <div>
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <input value={wizard.name} onChange={e => updateField({ name: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <input type="tel" value={wizard.phone} onChange={e => updateField({ phone: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="+263 77 XXX XXXX" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <input type="email" value={wizard.email} onChange={e => updateField({ email: e.target.value })} className={`w-full p-3 rounded-xl border text-sm ${errors.email ? 'border-red-400' : 'border-gray-200'}`} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" checked={wizard.payAfterInstall} onChange={e => updateField({ payAfterInstall: e.target.checked })} className="w-4 h-4 accent-[#228B22]" />
              <span className="text-sm text-[#1F2937]">Pay After Installation</span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <input type="checkbox" className="w-4 h-4 accent-[#228B22]" />
              <span className="text-xs text-gray-500">I agree to the terms & conditions</span>
            </label>
            <button onClick={handleGenerateQuote} className="w-full bg-[#228B22] text-white rounded-lg py-3 font-semibold">Generate Quote</button>
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

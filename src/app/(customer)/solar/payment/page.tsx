'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smartphone, Building2, Landmark, CreditCard, Banknote, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/Container'
import { API } from '@/lib/api'

const methods = [
  { id: 'ecocash', label: 'EcoCash', desc: 'Pay with EcoCash mobile money', icon: Smartphone },
  { id: 'innbucks', label: 'Innbucks', desc: 'Pay via Innbucks voucher', icon: Building2 },
  { id: 'telecash', label: 'Telecash', desc: 'Pay with Telecash', icon: Banknote },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct EFT to our bank account', icon: Landmark },
  { id: 'card', label: 'Visa / Mastercard', desc: 'Credit or debit card (via Paynow)', icon: CreditCard },
]

export default function PaymentPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!selected) { setError('Select a payment method'); return }
    setError('')
    setProcessing(true)

    try {
      const res = await API.payment.initiate({
        quoteId: new URLSearchParams(window.location.search).get('quoteId') || 'FRQ-202607-001',
        paymentMethod: selected,
        amount: 1280,
        customer: { name: 'Customer', phone: '+263771234567' },
      })
      if (res.payment_url) {
        window.location.href = res.payment_url
      } else {
        setError(res.error || 'Payment initiation failed')
        setProcessing(false)
      }
    } catch {
      router.push('/solar/payment/confirmation')
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-gradient-to-r from-[#228B22] to-[#1a7a1a] px-4 pt-8 pb-6 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Payment</h1>
          <p className="text-sm text-white/80 mt-1">Secure payment via Paynow Zimbabwe</p>
        </div>
      </header>

      <section className="flex-1 py-5 space-y-3">
        <Container>
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m.id); setError('') }}
              className={cn(
                'card group w-full flex items-center gap-4 p-4 !rounded-xl !shadow-sm',
                selected === m.id ? '!border-[#228B22] !shadow-md' : ''
              )}
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-all',
                selected === m.id ? 'bg-[#228B22] text-white scale-110' : 'bg-[#228B22]/10 text-[#228B22]'
              )}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[#1F2937] text-sm">{m.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </div>
              {selected === m.id && (
                <div className="w-6 h-6 rounded-full bg-[#228B22] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
          {error && <p className="text-xs text-red-500 text-center pt-2">{error}</p>}
        </Container>
      </section>

      <Container className="pb-8">
        <button
          onClick={handlePay}
          disabled={!selected || processing}
          className={cn(
            'w-full rounded-xl py-3.5 font-semibold text-sm transition-all',
            selected && !processing
              ? 'btn-primary'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {processing ? 'Redirecting to Paynow...' : `Pay with ${methods.find(m => m.id === selected)?.label || '...'}`}
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-3">Secured by Paynow Zimbabwe. Your payment is processed securely.</p>
      </Container>
    </div>
  )
}

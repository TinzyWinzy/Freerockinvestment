'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Smartphone, Building2, Landmark, CreditCard, Banknote, Check, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/Container'
import { API } from '@/lib/api'
import { getWhatsAppLink, paymentNotifyMessage } from '@/lib/whatsapp'

const methods = [
  { id: 'ecocash', label: 'EcoCash', desc: 'Pay with EcoCash mobile money', icon: Smartphone },
  { id: 'innbucks', label: 'Innbucks', desc: 'Pay via Innbucks voucher', icon: Building2 },
  { id: 'telecash', label: 'Telecash', desc: 'Pay with Telecash', icon: Banknote },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct EFT to our bank account', icon: Landmark },
  { id: 'card', label: 'Visa / Mastercard', desc: 'Credit or debit card (via Paynow)', icon: CreditCard },
]

interface QuoteData {
  id: string
  customer: { fullName: string; email?: string; phone: string }
  pricing: { depositAmount: number }
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quoteId') || ''
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [selected, setSelected] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!quoteId) return
    try {
      const raw = localStorage.getItem(`quote-${quoteId}`)
      if (raw) setQuote(JSON.parse(raw))
    } catch { }
  }, [quoteId])

  const handlePay = async () => {
    if (!selected) { setError('Select a payment method'); return }
    if (!quote) { setError('Quote not found. Please generate a new quote.'); return }
    setError('')
    setProcessing(true)

    try {
      const res = await API.payment.initiate({
        quoteId: quote.id,
        paymentMethod: selected,
        amount: quote.pricing.depositAmount,
        customer: { name: quote.customer.fullName, phone: quote.customer.phone, email: quote.customer.email || '' },
      })

      if (res.error) {
        setError(res.error)
        setProcessing(false)
        return
      }

      // Mark the local quote record as deposit-paid so the quote page and
      // "My Quotes" list reflect the real state immediately.
      try {
        const updated = { ...quote, paymentStatus: 'deposit_paid' }
        localStorage.setItem(`quote-${quote.id}`, JSON.stringify(updated))
      } catch { }
      API.quote.update(quote.id, { paymentStatus: 'deposit_paid', paymentMethod: selected }).catch(() => { })

      if (res.payment_url) {
        window.location.href = res.payment_url
      } else {
        router.push(`/solar/payment/confirmation?quoteId=${quote.id}`)
      }
    } catch {
      setError('Could not reach the payment gateway. Please check your connection and try again.')
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-gradient-to-r from-[#228B22] to-[#1a7a1a] px-4 pt-8 pb-6 text-white">
        <Container>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Payment</h1>
          <p className="text-sm text-white/80 mt-1">Secure payment via Paynow Zimbabwe</p>
          {quote && <p className="text-sm text-white/90 mt-2 font-semibold">Deposit due: ${quote.pricing.depositAmount.toLocaleString()}</p>}
        </Container>
      </header>

      <section className="flex-1 py-5 space-y-3">
        <Container>
          <div role="radiogroup" aria-label="Payment method" className="space-y-3">
            {methods.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={selected === m.id}
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
          </div>
          {error && <p role="alert" className="text-xs text-red-500 text-center pt-2">{error}</p>}

          {selected && quote && (
            <a
              href={getWhatsAppLink(paymentNotifyMessage({ name: quote.customer.fullName, quoteId: quote.id, depositUsd: quote.pricing.depositAmount, paymentMethod: methods.find(m => m.id === selected)?.label }))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Notify Freerock on WhatsApp
            </a>
          )}
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
          {processing ? 'Processing...' : `Pay with ${methods.find(m => m.id === selected)?.label || '...'}`}
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-3">Secured by Paynow Zimbabwe. Your payment is processed securely.</p>
      </Container>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 min-h-dvh"><div className="skeleton w-8 h-8 rounded-full" /></div>}>
      <PaymentPageContent />
    </Suspense>
  )
}

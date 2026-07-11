'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { SOLAR_PACKAGES } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { ChevronDown, ChevronUp, MessageCircle, Download, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { getWhatsAppLink, quoteReadyMessage } from '@/lib/whatsapp'

interface QuoteData {
  id: string
  customer: { fullName: string; email?: string; phone: string }
  serviceId: string
  serviceName: string
  pricing: { subtotal: number; depositRate: number; depositAmount: number; balance: number }
  addons: { tvBundle?: boolean }
  paymentStatus: string
  createdAt: string
}

function QuotePageContent() {
  const params = useParams()
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  let quote: QuoteData | null = null
  try {
    const raw = localStorage.getItem(`quote-${params.id}`)
    if (raw) quote = JSON.parse(raw)
  } catch { }

  const pkg = quote ? SOLAR_PACKAGES.find(p => p.id === quote!.serviceId) : null

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-dvh p-4 space-y-4">
        <CardSkeleton />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] px-4 text-center">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="font-semibold text-[#1F2937]">Quote not found</h2>
        <p className="text-sm text-gray-500 mt-1">This quote may have expired or been removed.</p>
        <Link href="/solar" className="mt-4 btn-primary text-sm">Get a New Quote</Link>
      </div>
    )
  }

  const { subtotal, depositRate, depositAmount, balance } = quote.pricing
  const isPaid = quote.paymentStatus === 'deposit_paid' || quote.paymentStatus === 'fully_paid'

  const whatsappLink = getWhatsAppLink(quoteReadyMessage({
    name: quote.customer.fullName,
    quoteId: quote.id,
    packageName: quote.serviceName,
    totalUsd: subtotal,
    depositUsd: depositAmount,
  }))

  const handleDownload = async () => {
    setDownloadError('')
    setDownloading(true)
    try {
      const res = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote!.id,
          customerName: quote!.customer.fullName,
          items: [{ name: quote!.serviceName, price: subtotal }],
          total: subtotal,
          deposit: depositAmount,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate invoice')
      const html = await res.text()
      const blob = new Blob([html], { type: 'text/html' })
      window.open(URL.createObjectURL(blob), '_blank')
    } catch {
      setDownloadError('Could not generate the invoice. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh pb-24">
      <header className="relative overflow-hidden bg-freerock px-4 pt-8 pb-6 text-white">
        <Image src="/images/backview.jpg" alt="" fill className="object-cover opacity-20" sizes="100vw" priority />
        <div className="relative z-10">
          <h1 className="text-xl font-bold">Your Quote</h1>
          <p className="text-sm text-white/80 mt-1">#{quote.id}</p>
        </div>
      </header>

      <section className="flex-1 py-4 space-y-4"><Container>
        {isPaid && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Deposit paid — we&apos;ll be in touch to schedule installation.
          </div>
        )}
        <div className="border border-gray-200 rounded-xl p-4">
          <h2 className="font-bold text-freerock-dark">{quote.serviceName}</h2>
          {pkg && (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Inverter: {pkg.specs.inverter}</p>
              <p>Battery: {pkg.specs.battery}</p>
              <p>Panels: {pkg.specs.panels}</p>
            </div>
          )}
          {quote.addons?.tvBundle && (
            <p className="mt-2 text-sm font-medium text-freerock">✓ TV Bundle included</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Package price</span>
            <span className="font-medium text-freerock-dark">{formatUSD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit ({Math.round(depositRate * 100)}%)</span>
            <span className="font-bold text-freerock-dark">{formatUSD(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Balance on installation</span>
            <span className="font-medium text-freerock-dark">{formatUSD(balance)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-freerock">{formatUSD(subtotal)}</span>
          </div>
        </div>

        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          aria-expanded={accordionOpen}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl text-sm font-medium text-freerock-dark"
        >
          Pay After Install Terms
          {accordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {accordionOpen && (
          <div className="px-4 py-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-2">
            <p>• Pay {Math.round(depositRate * 100)}% deposit upfront to confirm your order.</p>
            <p>• Remaining {Math.round((1 - depositRate) * 100)}% is paid upon successful installation and commissioning.</p>
            <p>• Free site inspection included.</p>
            <p>• 1-year warranty on all equipment and installation.</p>
          </div>
        )}
        {downloadError && <p role="alert" className="text-xs text-red-500 text-center">{downloadError}</p>}
      </Container></section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-center">
        {isPaid ? (
          <div className="flex-1 bg-green-50 text-green-700 rounded-lg py-3 font-semibold text-sm text-center">Deposit Paid</div>
        ) : (
          <Link href={`/solar/payment?quoteId=${quote.id}`} className="flex-1 bg-freerock text-white rounded-lg py-3 font-semibold text-sm text-center">
            Pay Deposit {formatUSD(depositAmount)}
          </Link>
        )}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ask a question on WhatsApp"
          className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-lg text-freerock"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <button
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Download invoice"
          className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-lg text-gray-500 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function QuotePage() {
  return (
    <ErrorBoundary>
      <QuotePageContent />
    </ErrorBoundary>
  )
}

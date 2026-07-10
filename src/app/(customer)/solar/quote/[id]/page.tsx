'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SOLAR_PACKAGES, DEPOSIT_RATES } from '@/lib/constants'
import { formatUSD } from '@/lib/utils'
import { ChevronDown, ChevronUp, MessageCircle, Download, FileText } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { getWhatsAppLink, quoteReadyMessage } from '@/lib/whatsapp'

interface QuoteData {
  id: string
  packageId: string
  tvBundle: boolean
  payAfterInstall: boolean
  createdAt: string
}

function QuotePageContent() {
  const params = useParams()
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  let quote: QuoteData | null = null
  try {
    const raw = localStorage.getItem(`quote-${params.id}`)
    if (raw) quote = JSON.parse(raw)
  } catch { }

  const pkg = quote ? SOLAR_PACKAGES.find(p => p.id === quote.packageId) : null

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-dvh p-4 space-y-4">
        <CardSkeleton />
      </div>
    )
  }

  if (!quote || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] px-4 text-center">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="font-semibold text-[#1F2937]">Quote not found</h2>
        <p className="text-sm text-gray-500 mt-1">This quote may have expired or been removed.</p>
        <Link href="/solar" className="mt-4 btn-primary text-sm">Get a New Quote</Link>
      </div>
    )
  }

  const depositRate = DEPOSIT_RATES[pkg.id] || 0.3
  const deposit = Math.round(pkg.priceUSD * depositRate)
  const balance = pkg.priceUSD - deposit

  const whatsappLink = getWhatsAppLink(quoteReadyMessage({
    name: 'Customer',
    quoteId: quote.id,
    packageName: pkg.name,
    totalUsd: pkg.priceUSD,
    depositUsd: deposit,
  }))

  return (
    <div className="flex flex-col flex-1 min-h-dvh pb-24">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">Your Quote</h1>
        <p className="text-sm text-white/80 mt-1">#{quote.id}</p>
      </header>

      <section className="flex-1 py-4 space-y-4"><Container>
        <div className="border border-gray-200 rounded-xl p-4">
          <h2 className="font-bold text-freerock-dark">{pkg.name}</h2>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Inverter: {pkg.specs.inverter}</p>
            <p>Battery: {pkg.specs.battery}</p>
            <p>Panels: {pkg.specs.panels}</p>
          </div>
          {quote.tvBundle && (
            <p className="mt-2 text-sm font-medium text-freerock">✓ TV Bundle included</p>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Package price</span>
            <span className="font-medium text-freerock-dark">{formatUSD(pkg.priceUSD)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deposit ({depositRate * 100}%)</span>
            <span className="font-bold text-freerock-dark">{formatUSD(deposit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Balance on installation</span>
            <span className="font-medium text-freerock-dark">{formatUSD(balance)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-freerock">{formatUSD(pkg.priceUSD)}</span>
          </div>
        </div>

        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl text-sm font-medium text-freerock-dark"
        >
          Pay After Install Terms
          {accordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {accordionOpen && (
          <div className="px-4 py-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-2">
            <p>• Pay {depositRate * 100}% deposit upfront to confirm your order.</p>
            <p>• Remaining {100 - depositRate * 100}% is paid upon successful installation and commissioning.</p>
            <p>• Free site inspection included.</p>
            <p>• 1-year warranty on all equipment and installation.</p>
          </div>
        )}
      </Container></section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-center">
        <button className="flex-1 bg-freerock text-white rounded-lg py-3 font-semibold text-sm">
          Pay Deposit {formatUSD(deposit)}
        </button>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-lg text-freerock"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
        <button className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-lg text-gray-500">
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

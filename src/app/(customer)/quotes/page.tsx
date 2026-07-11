'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FileText, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Container } from '@/components/Container'
import { motion } from 'framer-motion'

interface SavedQuote {
  id: string
  serviceName?: string
  paymentStatus?: string
  pricing?: { depositAmount?: number }
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Draft',
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Paid',
}

export default function QuotesPage() {
  const { offlineQuotes, removeOfflineQuote } = useStore()
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    const loaded: SavedQuote[] = []
    offlineQuotes.forEach((id) => {
      try {
        const raw = localStorage.getItem(`quote-${id}`)
        if (raw) loaded.push(JSON.parse(raw))
      } catch { }
    })
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setQuotes(loaded)
  }, [offlineQuotes])

  const handleDelete = () => {
    if (!deleteTarget) return
    removeOfflineQuote(deleteTarget)
    localStorage.removeItem(`quote-${deleteTarget}`)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="relative overflow-hidden bg-freerock px-4 pt-8 pb-6 text-white">
        <Image src="/images/teamworking.jpg" alt="" fill className="object-cover opacity-20" sizes="100vw" priority />
        <div className="relative z-10">
          <h1 className="text-xl font-bold">My Quotes</h1>
          <p className="text-sm text-white/80 mt-1">Your saved solar quotes</p>
        </div>
      </header>

      <section className="flex-1 py-4"><Container>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-[#1F2937] text-base">No saved quotes</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">You haven&apos;t saved any quotes yet. Browse our solar packages to get started.</p>
            <Link href="/solar" className="mt-4 btn-primary text-sm">
              Browse Solar Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => {
              const status = STATUS_LABELS[q.paymentStatus ?? 'pending'] ?? 'Draft'
              const isPaid = q.paymentStatus === 'deposit_paid' || q.paymentStatus === 'fully_paid'
              return (
                <Link
                  key={q.id}
                  href={`/solar/quote/${q.id}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-freerock-dark text-sm">{q.id}</p>
                    {q.serviceName && <p className="text-xs text-gray-500">{q.serviceName}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-50 text-green-700' : 'bg-freerock/10 text-freerock'}`}>
                      {status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteTarget(q.id)
                      }}
                      aria-label={`Delete quote ${q.id}`}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Container></section>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-2xl rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Delete Quote</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary mb-4">Are you sure you want to delete this quote? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-danger text-white rounded-xl text-sm font-medium">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

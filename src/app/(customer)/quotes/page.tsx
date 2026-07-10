'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Container } from '@/components/Container'

interface SavedQuote {
  id: string
  packageId: string
  createdAt: string
}

export default function QuotesPage() {
  const { offlineQuotes, removeOfflineQuote } = useStore()
  const [quotes, setQuotes] = useState<SavedQuote[]>([])

  useEffect(() => {
    const loaded: SavedQuote[] = []
    offlineQuotes.forEach((id) => {
      try {
        const raw = localStorage.getItem(`quote-${id}`)
        if (raw) loaded.push(JSON.parse(raw))
      } catch { }
    })
    setQuotes(loaded)
  }, [offlineQuotes])

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <header className="bg-freerock px-4 pt-8 pb-6 text-white">
        <h1 className="text-xl font-bold">My Quotes</h1>
        <p className="text-sm text-white/80 mt-1">Your saved solar quotes</p>
      </header>

      <section className="flex-1 py-4"><Container>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No quotes yet</p>
            <Link href="/solar" className="mt-3 text-sm font-medium text-freerock">
              Get your first quote →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/solar/quote/${q.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-freerock-dark text-sm">{q.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-freerock/10 text-freerock font-medium px-2 py-0.5 rounded-full">
                    Draft
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeOfflineQuote(q.id)
                      localStorage.removeItem(`quote-${q.id}`)
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container></section>
    </div>
  )
}

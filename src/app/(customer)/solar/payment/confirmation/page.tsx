'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Copy, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Container } from '@/components/Container'

function ConfirmationContent() {
  const sp = useSearchParams()
  const [copied, setCopied] = useState(false)
  const quoteId = sp.get('quoteId') || 'FRQ-202607-001'

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <div className="flex-1 flex flex-col items-center justify-center text-center"><Container>
        <div className="w-16 h-16 rounded-full bg-[#228B22]/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#228B22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" strokeDasharray="20" strokeDashoffset="0" className="[stroke-dasharray:20] [animation:checkmark-draw_0.6s_ease-out_forwards]" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#1F2937]">Payment Successful!</h1>
        <p className="text-sm text-gray-500 mt-1">Your deposit has been confirmed.</p>

        <div className="mt-6 w-full max-w-sm border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Quote ID</span>
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-medium text-[#228B22]">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm font-bold text-[#1F2937] mt-1">{quoteId}</p>
        </div>

        <div className="mt-4 w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium text-[#1F2937]">Solar Installation</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-[#1F2937]">{new Date().toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Deposit Paid</span><span className="font-medium text-[#228B22]">$1,280</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Balance Due</span><span className="font-medium text-[#1F2937]">$1,920</span></div>
        </div>
      </Container></div>

      <Container className="pb-6 space-y-2">
        <Link href="/" className="block w-full bg-[#228B22] text-white text-center rounded-lg py-3 font-semibold text-sm">Back to Home</Link>
        <a href={`https://wa.me/263778931251?text=${encodeURIComponent(`Hi Freerock, I just paid the deposit for quote ${quoteId}.`)}`} target="_blank" rel="noopener noreferrer" className="block w-full border border-gray-200 text-gray-700 text-center rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-500" /> Share on WhatsApp
        </a>
        <p className="text-[11px] text-gray-400 text-center pt-2">Install our PWA for a faster experience — add to home screen</p>
      </Container>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 min-h-dvh"><div className="skeleton w-8 h-8 rounded-full" /></div>}>
      <ConfirmationContent />
    </Suspense>
  )
}

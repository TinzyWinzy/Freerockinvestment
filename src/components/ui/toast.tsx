'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useStore, type ToastItem } from '../../lib/store'

function Toaster({ className }: { className?: string }) {
  const toasts = useStore((s) => s.toasts)
  const removeToast = useStore((s) => s.removeToast)

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 flex flex-col gap-2', className)}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg',
              t.type === 'success' && 'bg-freerock',
              t.type === 'error' && 'bg-danger',
              t.type === 'info' && 'bg-text-primary'
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-md p-1 hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export { Toaster }

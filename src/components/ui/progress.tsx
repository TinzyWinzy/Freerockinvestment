'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ProgressProps {
  steps?: number
  currentStep: number
  className?: string
}

function Progress({ steps = 5, currentStep = 0, className }: ProgressProps) {
  return (
    <div className={cn('flex items-center w-full', className)} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps} aria-label={`Step ${currentStep + 1} of ${steps}`}>
      {Array.from({ length: steps }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div
              className={cn(
                'h-0.5 flex-1 transition-colors',
                i <= currentStep ? 'bg-freerock' : 'bg-border'
              )}
            />
          )}
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              i < currentStep && 'border-freerock bg-freerock',
              i === currentStep && 'border-freerock bg-freerock',
              i > currentStep && 'border-border bg-surface'
            )}
          >
            {i < currentStep && <Check className="size-4 text-white" />}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export { Progress }

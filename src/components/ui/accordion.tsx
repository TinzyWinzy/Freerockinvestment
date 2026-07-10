import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

const Accordion = React.forwardRef<HTMLDetailsElement, React.DetailsHTMLAttributes<HTMLDetailsElement>>(
  ({ className, children, ...props }, ref) => (
    <details ref={ref} className={cn('group rounded-lg border border-border', className)} {...props}>
      {children}
    </details>
  )
)
Accordion.displayName = 'Accordion'

const AccordionSummary = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <summary
      ref={ref}
      className={cn(
        'flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium list-none [&::-webkit-details-marker]:hidden',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
  )
)
AccordionSummary.displayName = 'AccordionSummary'

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('px-4 pb-3 pt-0 text-sm text-text-secondary', className)} {...props}>
      {children}
    </div>
  )
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionSummary, AccordionContent }

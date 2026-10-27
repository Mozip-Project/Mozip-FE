import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-gap-m rounded-l border border-neutral-weak bg-layer-default px-padding-xxl py-16 text-center',
        className,
      )}
    >
      <div
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-weak text-neutral-muted"
      >
        {icon}
      </div>
      <div className="flex flex-col items-center gap-gap-xs pt-gap-xs break-words">
        <p className="text-heading2 font-bold text-neutral">{title}</p>
        {description && <p className="text-body2 text-neutral-muted">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap justify-center gap-gap-s pt-padding-xs">{actions}</div>
      )}
    </div>
  )
}

export { EmptyState }

import GripVerticalIcon from '@/assets/icons/gripVertical.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type QuestionCardProps = {
  index: number
  title: string
  description?: string
  required?: boolean
  isSelected?: boolean
  actions?: ReactNode
  children: ReactNode
}

function QuestionCard({
  index,
  title,
  description,
  required = false,
  isSelected = false,
  actions,
  children,
}: QuestionCardProps) {
  return (
    <article
      data-selected={isSelected ? '' : undefined}
      className={cn(
        'flex min-w-70 flex-col gap-gap-l rounded-l border bg-layer-default p-padding-xl',
        isSelected ? 'border-neutral-solid' : 'border-neutral-muted',
      )}
    >
      <div className="flex flex-col gap-gap-s">
        <div className="flex items-center justify-between gap-gap-s">
          <div className="flex items-center gap-gap-xs">
            <GripVerticalIcon aria-hidden className="size-6 shrink-0 text-neutral-faint" />
            <Badge tone="brand" variant="weak">
              Q{index}
            </Badge>
          </div>
          {actions}
        </div>
        <div className="flex flex-col gap-gap-xxs break-keep">
          <p className="text-body1 font-semibold text-neutral">
            {title}
            {required && (
              <>
                <span aria-hidden className="ml-1 align-top text-label1 text-critical">
                  *
                </span>
                <span className="sr-only">필수</span>
              </>
            )}
          </p>
          {description && (
            <p className="text-label1 font-normal text-neutral-subtle">{description}</p>
          )}
        </div>
      </div>
      <hr className="border-neutral-subtle" />
      <div inert className="flex flex-col gap-gap-l">
        {children}
      </div>
    </article>
  )
}

export { QuestionCard }
export type { QuestionCardProps }

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
  onSelect?: () => void
  children: ReactNode
}

function QuestionCard({
  index,
  title,
  description,
  required = false,
  isSelected = false,
  actions,
  onSelect,
  children,
}: QuestionCardProps) {
  return (
    <article
      data-selected={isSelected ? '' : undefined}
      className={cn(
        'relative flex min-w-70 flex-col gap-gap-l rounded-l border bg-layer-default p-padding-xl',
        isSelected ? 'border-neutral-solid' : 'border-neutral-muted',
      )}
    >
      {onSelect && (
        // 카드 안 메뉴 버튼과 겹치지 않도록 카드 전체를 덮는 선택 버튼
        <button
          type="button"
          aria-label={`Q${index} ${title} 편집`}
          aria-pressed={isSelected}
          onClick={onSelect}
          className="absolute inset-0 cursor-pointer rounded-l outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        />
      )}
      <div className="flex flex-col gap-gap-s">
        <div className="flex items-center justify-between gap-gap-s">
          <div className="flex items-center gap-gap-xs">
            <GripVerticalIcon aria-hidden className="size-6 shrink-0 text-neutral-faint" />
            <Badge tone="brand" variant="weak">
              Q{index}
            </Badge>
          </div>
          {actions && <div className="relative">{actions}</div>}
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

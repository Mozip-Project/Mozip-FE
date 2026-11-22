'use client'

import { useId, useState, type ReactNode } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { cn } from '@/lib/utils'

const FOCUS_RING_CLASS =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid'

type ActivityItemProps = {
  title: string
  collapsedTitle?: string
  defaultOpen?: boolean
  onRemove: () => void
  children: ReactNode
}

function ActivityItem({
  title,
  collapsedTitle,
  defaultOpen = true,
  onRemove,
  children,
}: ActivityItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const bodyId = useId()
  const headerTitle = isOpen ? title : collapsedTitle || title
  // Figma 기준 입력한 활동명으로 접힌 항목은 배경 구분
  const isCollapsedWithTitle = !isOpen && Boolean(collapsedTitle)

  return (
    <section
      className={cn(
        'overflow-hidden rounded-l border border-neutral-subtle',
        isCollapsedWithTitle ? 'bg-layer-basement' : 'bg-layer-default',
      )}
    >
      <div className={cn('flex items-center gap-gap-s p-padding-m', isOpen && 'h-15')}>
        <p
          className={cn(
            'min-w-0 flex-1 truncate font-semibold text-neutral',
            isOpen ? 'text-body2' : 'text-body1',
          )}
        >
          {headerTitle}
        </p>
        <div className="flex shrink-0 items-center gap-gap-s">
          <button
            type="button"
            aria-label={`${headerTitle} 삭제`}
            onClick={onRemove}
            className={cn(
              'cursor-pointer rounded-s px-padding-xs py-padding-xxs text-label2 font-semibold text-neutral-subtle',
              FOCUS_RING_CLASS,
            )}
          >
            삭제
          </button>
          <button
            type="button"
            aria-label={headerTitle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            onClick={() => setIsOpen(!isOpen)}
            className={cn('cursor-pointer rounded-xs text-neutral-subtle', FOCUS_RING_CLASS)}
          >
            <ChevronDownIcon aria-hidden className={cn('size-5', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>
      <div
        id={bodyId}
        hidden={!isOpen}
        className="flex flex-col gap-gap-l border-t border-neutral-subtle px-padding-m py-padding-l"
      >
        {children}
      </div>
    </section>
  )
}

export { ActivityItem }
export type { ActivityItemProps }

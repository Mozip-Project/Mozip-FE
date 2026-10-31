import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type LnbStageItemProps = {
  icon: ReactNode
  label: string
  statusLabel?: string
  isActive?: boolean
  isStatusHighlighted?: boolean
  // 하위 메뉴가 없는 단계는 생략해 chevron 제외
  isExpanded?: boolean
}

function LnbStageItem({
  icon,
  label,
  statusLabel,
  isActive = false,
  isStatusHighlighted = false,
  isExpanded,
}: LnbStageItemProps) {
  return (
    <div
      className={cn(
        'flex h-10 items-center gap-gap-s rounded-m px-padding-s text-body2 font-medium text-neutral-muted',
        isActive && 'font-semibold text-neutral',
      )}
    >
      <span className="size-5 shrink-0 [&_svg]:size-full">{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {statusLabel && (
        <span
          className={cn(
            'shrink-0 text-caption1 font-medium',
            isStatusHighlighted ? 'text-brand' : 'text-placeholder',
          )}
        >
          {statusLabel}
        </span>
      )}
      {isExpanded !== undefined && (
        <ChevronDownIcon
          aria-hidden
          className={cn('size-4 shrink-0', isExpanded && 'rotate-180')}
        />
      )}
    </div>
  )
}

export { LnbStageItem }

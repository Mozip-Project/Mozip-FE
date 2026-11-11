'use client'

import CloseIcon from '@/assets/icons/close.svg'
import { cn } from '@/lib/utils'
import { CHIP_SHAPE_CLASS } from './chip'
import type { ReactNode } from 'react'

type RemovableChipTone = 'neutral' | 'brand'

// brand는 Chip 선택 상태와 같은 색(적용된 필터 등)
const REMOVABLE_CHIP_TONE_CLASS = {
  neutral: { chip: '', removeButton: 'text-neutral' },
  brand: { chip: 'border-brand-weak bg-brand-weak text-brand', removeButton: 'text-brand' },
} satisfies Record<RemovableChipTone, { chip: string; removeButton: string }>

type RemovableChipProps = {
  children: ReactNode
  onRemove: () => void
  removeLabel: string
  tone?: RemovableChipTone
  className?: string
}

function RemovableChip({
  children,
  onRemove,
  removeLabel,
  tone = 'neutral',
  className,
}: RemovableChipProps) {
  const toneClass = REMOVABLE_CHIP_TONE_CLASS[tone]

  return (
    <span
      data-slot="removable-chip"
      className={cn(CHIP_SHAPE_CLASS, 'cursor-default', toneClass.chip, className)}
    >
      {children}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className={cn(
          // 16px 아이콘 대신 32px 터치 영역 확보
          "relative size-4 shrink-0 cursor-pointer rounded-full after:absolute after:-inset-2 after:content-['']",
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
          toneClass.removeButton,
        )}
      >
        <CloseIcon aria-hidden className="pointer-events-none size-4" />
      </button>
    </span>
  )
}

export { RemovableChip }

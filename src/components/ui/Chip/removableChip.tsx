'use client'

import CloseIcon from '@/assets/icons/close.svg'
import { cn } from '@/lib/utils'
import { CHIP_SHAPE_CLASS } from './chip'
import type { ReactNode } from 'react'

type RemovableChipProps = {
  children: ReactNode
  onRemove: () => void
  removeLabel: string
  className?: string
}

function RemovableChip({ children, onRemove, removeLabel, className }: RemovableChipProps) {
  return (
    <span data-slot="removable-chip" className={cn(CHIP_SHAPE_CLASS, 'cursor-default', className)}>
      {children}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className={cn(
          // 16px 아이콘 대신 32px 터치 영역 확보
          "relative size-4 shrink-0 cursor-pointer rounded-full text-neutral after:absolute after:-inset-2 after:content-['']",
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        )}
      >
        <CloseIcon aria-hidden className="pointer-events-none size-4" />
      </button>
    </span>
  )
}

export { RemovableChip }

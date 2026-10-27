'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

export const SEGMENT_TONES = ['brand', 'warning', 'critical'] as const
export const SEGMENT_SIZES = ['l', 'm', 's'] as const

type SegmentTone = (typeof SEGMENT_TONES)[number]
type SegmentSize = (typeof SEGMENT_SIZES)[number]

// Figma 'Segment Tone' 변수 모드: Brand=합격·점수, Warning=보류, Critical=불합격
const SELECTED_TONE_CLASS = {
  brand: 'aria-checked:border-brand-solid aria-checked:bg-brand-weak aria-checked:text-brand',
  warning:
    'aria-checked:border-warning-solid aria-checked:bg-warning-weak aria-checked:text-warning',
  critical:
    'aria-checked:border-critical-solid aria-checked:bg-critical-weak aria-checked:text-critical',
} as const satisfies Record<SegmentTone, string>

const SIZE_CLASS = {
  l: 'h-10',
  m: 'h-9',
  s: 'h-8',
} as const satisfies Record<SegmentSize, string>

type SegmentOptionProps = ComponentProps<typeof RadioGroupPrimitive.Item> & {
  tone?: SegmentTone
  size?: SegmentSize
}

// Dimmed·Error는 그룹 상태에서 결정. 부모 RadioGroup에 group/segment 클래스와 aria-invalid 필요
function SegmentOption({ className, tone = 'brand', size = 'l', ...props }: SegmentOptionProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="segment-option"
      className={cn(
        'inline-flex min-w-13 shrink-0 cursor-pointer items-center justify-center gap-gap-xs rounded-s border border-neutral-muted bg-layer-default px-padding-m',
        'text-body2 font-medium whitespace-nowrap text-neutral select-none',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
        'disabled:pointer-events-none',
        'group-aria-invalid/segment:border-critical-solid',
        'group-has-aria-checked/segment:not-aria-checked:border-neutral-subtle group-has-aria-checked/segment:not-aria-checked:text-disabled',
        'aria-checked:font-semibold',
        SELECTED_TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  )
}

export { SegmentOption }

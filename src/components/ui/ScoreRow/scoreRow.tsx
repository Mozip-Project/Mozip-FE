'use client'

import { useId, type ComponentProps } from 'react'
import { SegmentGroup } from '@/components/ui/SegmentGroup/segmentGroup'
import { SegmentOption } from '@/components/ui/SegmentGroup/segmentOption'
import { cn } from '@/lib/utils'

const SCORE_OPTIONS = ['1', '2', '3', '4', '5'] as const

type ScoreRowProps = Omit<
  ComponentProps<typeof SegmentGroup>,
  'children' | 'errorMessage' | 'aria-label' | 'aria-labelledby'
> & {
  label: string
  errorMessage?: string
}

// 오류 문구는 SegmentGroup 대신 라벨 줄에 표시
function ScoreRow({ label, errorMessage, className, ...props }: ScoreRowProps) {
  const labelId = useId()
  const errorId = useId()
  const hasError = Boolean(errorMessage)

  return (
    <div data-slot="score-row" className={cn('flex min-w-70 flex-col gap-gap-xs', className)}>
      <div className="flex items-center justify-between gap-gap-s">
        <span
          id={labelId}
          className={cn(
            'min-w-0 text-label1 font-medium break-keep',
            hasError ? 'text-critical' : 'text-neutral-subtle',
          )}
        >
          {label}
        </span>
        {hasError && (
          <span
            id={errorId}
            className="shrink-0 text-caption1 font-medium whitespace-nowrap text-critical"
          >
            {errorMessage}
          </span>
        )}
      </div>
      <SegmentGroup
        aria-labelledby={labelId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...props}
      >
        {SCORE_OPTIONS.map((score) => (
          <SegmentOption key={score} value={score}>
            {score}
          </SegmentOption>
        ))}
      </SegmentGroup>
    </div>
  )
}

export { ScoreRow }

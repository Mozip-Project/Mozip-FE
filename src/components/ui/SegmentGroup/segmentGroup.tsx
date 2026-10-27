'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useId, type ComponentProps } from 'react'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import { cn } from '@/lib/utils'

type SegmentGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root> & {
  // 값이 있으면 Error 상태로 표시하고 그룹과 연결
  errorMessage?: string
}

function SegmentGroup({ className, errorMessage, ...props }: SegmentGroupProps) {
  const errorId = useId()

  return (
    <div data-slot="segment-group" className={cn('flex flex-col gap-gap-s', className)}>
      <RadioGroupPrimitive.Root
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        orientation="horizontal"
        className={cn(
          'group/segment flex flex-wrap gap-gap-xs',
          // 옵션 자체의 shrink-0·min-w-13보다 우선해 같은 폭으로 채우고, 문구보다 좁아지면 다음 줄로 배치
          '[&>[data-slot=segment-option]]:min-w-fit [&>[data-slot=segment-option]]:flex-1',
        )}
        {...props}
      />
      {errorMessage && (
        <p
          id={errorId}
          className="flex items-center gap-gap-xxs self-start text-caption1 font-medium text-critical"
        >
          <AlertCircleIcon aria-hidden className="shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export { SegmentGroup }

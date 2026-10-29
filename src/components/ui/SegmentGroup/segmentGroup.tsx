'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useId, type ComponentProps } from 'react'
import InfoIcon from '@/assets/icons/info.svg'
import { cn } from '@/lib/utils'

type SegmentGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root> & {
  errorMessage?: string
}

function SegmentGroup({
  className,
  errorMessage,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SegmentGroupProps) {
  const errorId = useId()
  const descriptionIds = [describedBy, errorMessage && errorId].filter(Boolean).join(' ')

  return (
    <div data-slot="segment-group" className={cn('flex flex-col gap-gap-s', className)}>
      <RadioGroupPrimitive.Root
        aria-invalid={errorMessage ? true : ariaInvalid}
        aria-describedby={descriptionIds || undefined}
        orientation="horizontal"
        className={cn(
          'group/segment flex gap-gap-xs',
          // 옵션의 shrink-0·min-w-13 대신 같은 폭 분배
          '[&>[data-slot=segment-option]]:min-w-0 [&>[data-slot=segment-option]]:flex-1',
        )}
        {...props}
      />
      {errorMessage && (
        <p
          id={errorId}
          className="flex items-center gap-gap-xxs self-start text-caption1 font-medium text-critical"
        >
          <InfoIcon aria-hidden className="shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export { SegmentGroup }

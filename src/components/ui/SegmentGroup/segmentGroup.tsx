'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { useId, useState, type ComponentProps, type MouseEvent } from 'react'
import InfoIcon from '@/assets/icons/info.svg'
import { cn } from '@/lib/utils'

type SegmentGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root> & {
  errorMessage?: string
}

function SegmentGroup({
  className,
  errorMessage,
  value,
  defaultValue,
  onValueChange,
  onClickCapture,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SegmentGroupProps) {
  const errorId = useId()
  const descriptionIds = [describedBy, errorMessage && errorId].filter(Boolean).join(' ')
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const selectedValue = value ?? uncontrolledValue

  function handleValueChange(nextValue: string) {
    if (value === undefined) {
      setUncontrolledValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  // 선택된 옵션을 다시 누르면 선택 해제
  // form 안에서는 Radix가 옵션 클릭 전파를 막아 capture 단계에서 처리
  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    onClickCapture?.(event)

    const option = event.target instanceof Element ? event.target.closest('[role="radio"]') : null

    if (option?.getAttribute('aria-checked') === 'true') {
      handleValueChange('')
    }
  }

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
        value={selectedValue}
        onValueChange={handleValueChange}
        onClickCapture={handleClickCapture}
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

'use client'

import { useId, useState, type ChangeEvent, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type TextAreaProps = ComponentProps<'textarea'>

function TextArea({
  className,
  maxLength,
  value,
  defaultValue,
  onChange,
  'aria-describedby': describedBy,
  ...props
}: TextAreaProps) {
  const counterId = useId()
  const [uncontrolledLength, setUncontrolledLength] = useState(String(defaultValue ?? '').length)
  const length = value === undefined ? uncontrolledLength : String(value).length
  const hasCounter = maxLength !== undefined
  const descriptionIds = [describedBy, hasCounter && counterId].filter(Boolean).join(' ')

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setUncontrolledLength(event.target.value.length)
    onChange?.(event)
  }

  return (
    // 최소 높이는 className으로 조정
    <div data-slot="text-area" className={cn('relative flex min-h-24 flex-col', className)}>
      <textarea
        data-slot="text-area-input"
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        aria-describedby={descriptionIds || undefined}
        className={cn(
          'field-sizing-content w-full flex-1 resize-none rounded-m border border-neutral-muted bg-layer-default px-padding-m py-padding-s text-body2 font-normal text-neutral placeholder:text-placeholder',
          'transition-colors outline-none focus:border-brand-solid motion-reduce:transition-none',
          'read-only:border-neutral-subtle read-only:bg-neutral-weak',
          // 카운터 높이만큼 하단 여백 확보
          hasCounter && 'pb-7',
        )}
        {...props}
      />
      {hasCounter && (
        <p
          id={counterId}
          data-slot="text-area-counter"
          className="pointer-events-none absolute right-padding-m bottom-padding-s text-caption1 font-medium text-disabled"
        >
          <span className={cn('font-semibold', length > 0 && 'text-neutral-muted')}>{length}</span>
          {`/${maxLength}`}
        </p>
      )}
    </div>
  )
}

export { TextArea }

'use client'

import {
  useId,
  useState,
  type ComponentProps,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

type TextFieldProps = ComponentProps<'input'> & {
  label?: ReactNode
  helper?: string
  // 입력창 안 오른쪽 끝 버튼 자리
  trailing?: ReactNode
}

function TextField({
  label,
  helper,
  trailing,
  className,
  id,
  required,
  'aria-describedby': describedBy,
  onPointerDown,
  onBlur,
  ...props
}: TextFieldProps) {
  // 텍스트 입력은 클릭에도 :focus-visible이 적용되어 포인터로 들어온 포커스는 blur 전까지 기억
  // 입력 중 keydown에도 링이 숨겨진 채 유지되어야 해서 usePointerFocus 대신 사용
  const [isPointerFocus, setIsPointerFocus] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = `${generatedId}-helper`
  const descriptionIds = [describedBy, helper && helperId].filter(Boolean).join(' ')

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    setIsPointerFocus(true)
    onPointerDown?.(event)
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setIsPointerFocus(false)
    onBlur?.(event)
  }

  const input = (
    <input
      id={inputId}
      data-slot="text-field-input"
      required={required}
      aria-describedby={descriptionIds || undefined}
      data-pointer-focus={isPointerFocus ? '' : undefined}
      onPointerDown={handlePointerDown}
      onBlur={handleBlur}
      className={cn(
        'h-12 w-full min-w-0 rounded-m border border-neutral-weak bg-layer-default px-padding-m text-body2 font-normal text-neutral placeholder:text-placeholder',
        'transition-colors outline-none not-aria-invalid:focus:border-neutral-solid motion-reduce:transition-none',
        'aria-invalid:border-critical-solid aria-invalid:not-data-pointer-focus:focus-visible:outline-2 aria-invalid:not-data-pointer-focus:focus-visible:outline-offset-2 aria-invalid:not-data-pointer-focus:focus-visible:outline-focus-ring aria-invalid:not-data-pointer-focus:focus-visible:outline-solid',
        'disabled:pointer-events-none disabled:border-neutral-muted disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled',
        trailing && 'pr-11',
      )}
      {...props}
    />
  )

  return (
    <div data-slot="text-field" className={cn('group flex flex-col gap-gap-s', className)}>
      {label && (
        <label
          htmlFor={inputId}
          // 라벨 클릭으로 들어온 포커스도 포인터 포커스로 처리
          onPointerDown={() => setIsPointerFocus(true)}
          data-slot="text-field-label"
          className="flex w-fit items-center gap-gap-xs text-label1 font-semibold text-neutral group-has-disabled:text-disabled"
        >
          {label}
          {/* 필수 여부는 input required로 전달 */}
          {required && (
            <span aria-hidden className="text-critical group-has-disabled:text-disabled">
              *
            </span>
          )}
        </label>
      )}
      {trailing ? (
        <div className="relative">
          {input}
          {/* 입력 텍스트와 같은 안쪽 여백(테두리 1px + padding-m) */}
          <div className="absolute inset-y-0 right-4.25 flex items-center">{trailing}</div>
        </div>
      ) : (
        input
      )}
      {helper && (
        <p
          id={helperId}
          data-slot="text-field-helper"
          className="text-label2 font-normal text-neutral-subtle group-has-disabled:text-disabled group-has-aria-invalid:text-critical"
        >
          {helper}
        </p>
      )}
    </div>
  )
}

export { TextField }

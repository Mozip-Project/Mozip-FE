import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TextFieldProps = ComponentProps<'input'> & {
  label?: ReactNode
  helper?: ReactNode
}

function TextField({
  label,
  helper,
  className,
  id,
  required,
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = `${inputId}-helper`
  const descriptionIds = [describedBy, helper && helperId].filter(Boolean).join(' ')

  return (
    <div data-slot="text-field" className={cn('group flex flex-col gap-gap-s', className)}>
      {label && (
        <label
          htmlFor={inputId}
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
      <input
        id={inputId}
        data-slot="text-field-input"
        required={required}
        aria-describedby={descriptionIds || undefined}
        className={cn(
          'h-12 w-full min-w-0 rounded-m border border-neutral-weak bg-layer-default px-padding-m text-body2 font-normal text-neutral placeholder:text-placeholder',
          'transition-colors outline-none not-aria-invalid:focus:border-neutral-solid motion-reduce:transition-none',
          'aria-invalid:border-critical-solid aria-invalid:focus-visible:outline-2 aria-invalid:focus-visible:outline-offset-2 aria-invalid:focus-visible:outline-focus-ring aria-invalid:focus-visible:outline-solid',
          'disabled:pointer-events-none disabled:border-neutral-muted disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled',
        )}
        {...props}
      />
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

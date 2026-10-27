import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TextFieldProps = ComponentProps<'input'> & {
  label?: ReactNode
}

function TextField({ label, className, id, ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div data-slot="text-field" className={cn('group flex flex-col gap-gap-s', className)}>
      {label && (
        <label
          htmlFor={inputId}
          data-slot="text-field-label"
          className="w-fit text-label1 font-semibold text-neutral group-has-disabled:text-disabled"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        data-slot="text-field-input"
        className={cn(
          'h-12 w-full min-w-0 rounded-m border border-neutral-weak bg-layer-default px-padding-m text-body2 font-normal text-neutral placeholder:text-placeholder',
          'transition-colors outline-none not-aria-invalid:focus:border-neutral-solid motion-reduce:transition-none',
          'aria-invalid:border-critical-solid aria-invalid:focus-visible:outline-2 aria-invalid:focus-visible:outline-offset-2 aria-invalid:focus-visible:outline-focus-ring aria-invalid:focus-visible:outline-solid',
          'disabled:pointer-events-none disabled:border-neutral-muted disabled:bg-disabled disabled:text-disabled disabled:placeholder:text-disabled',
        )}
        {...props}
      />
    </div>
  )
}

export { TextField }

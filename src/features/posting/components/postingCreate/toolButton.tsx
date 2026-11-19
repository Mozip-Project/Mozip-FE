import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'

type ToolButtonProps = Omit<ComponentPropsWithRef<'button'>, 'aria-label' | 'aria-pressed'> & {
  label: string
  isActive?: boolean
}

function ToolButton({ label, isActive = false, className, children, ...props }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'flex shrink-0 cursor-pointer items-center justify-center rounded-s border p-1.25 transition-colors motion-reduce:transition-none [&_svg]:size-5 [&_svg]:shrink-0',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        isActive
          ? 'border-brand-solid bg-brand-weak text-brand'
          : 'border-transparent text-neutral-muted hover:bg-transparent-pressed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ToolButton }
export type { ToolButtonProps }

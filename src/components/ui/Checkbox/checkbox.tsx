'use client'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import CheckIcon from '@/assets/icons/check.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function Checkbox({
  className,
  children,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  const box = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs border-[1.5px] border-neutral-weak bg-layer-default text-on-brand-solid',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'aria-checked:border-transparent aria-checked:bg-brand-solid',
        'disabled:pointer-events-none disabled:border-neutral-muted disabled:bg-disabled',
        'disabled:aria-checked:border-transparent disabled:aria-checked:bg-disabled disabled:aria-checked:text-disabled',
        !children && className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center [&>svg]:size-3.5"
      >
        <CheckIcon aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!children) {
    return box
  }

  return (
    <label
      data-slot="checkbox-label"
      className={cn(
        'inline-flex cursor-pointer items-center gap-gap-s text-body2 font-medium text-neutral has-disabled:pointer-events-none has-disabled:text-disabled',
        className,
      )}
    >
      {box}
      {children}
    </label>
  )
}

export { Checkbox }

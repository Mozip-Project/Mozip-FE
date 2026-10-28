'use client'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { CheckboxMark } from './checkboxMark'
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
        'relative flex shrink-0 cursor-pointer rounded-xs',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'disabled:pointer-events-none',
        !children && className,
      )}
      {...props}
    >
      <CheckboxMark />
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

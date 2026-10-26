'use client'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex flex-wrap gap-gap-s', className)}
      {...props}
    />
  )
}

function Radio({ className, children, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const circle = (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      className={cn(
        'relative size-5 shrink-0 cursor-pointer rounded-full border-[1.5px] border-neutral-weak bg-layer-default',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'aria-checked:border-6 aria-checked:border-brand-solid',
        'disabled:pointer-events-none',
        !children && 'disabled:opacity-40',
        !children && className,
      )}
      {...props}
    />
  )

  if (!children) {
    return circle
  }

  return (
    <label
      data-slot="radio-label"
      className={cn(
        'inline-flex cursor-pointer items-center gap-gap-s text-label1 font-normal text-neutral has-disabled:pointer-events-none has-disabled:opacity-40',
        className,
      )}
    >
      {circle}
      {children}
    </label>
  )
}

export { Radio, RadioGroup }

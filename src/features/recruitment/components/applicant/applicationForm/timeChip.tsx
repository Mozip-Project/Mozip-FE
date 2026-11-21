'use client'

import { Toggle as TogglePrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function TimeChip({ className, ...props }: ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="time-chip"
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-m border border-neutral-muted bg-layer-default px-3.5 py-2 text-label1 font-medium whitespace-nowrap text-neutral-subtle select-none',
        'aria-pressed:border-brand-solid aria-pressed:bg-brand-weak aria-pressed:font-semibold aria-pressed:text-brand',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

export { TimeChip }

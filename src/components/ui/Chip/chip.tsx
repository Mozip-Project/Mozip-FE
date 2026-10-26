'use client'

import { cva } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

const chipVariants = cva([
  'inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-gap-xs rounded-full border border-neutral-muted bg-layer-default px-padding-s',
  'text-label1 font-medium whitespace-nowrap text-neutral-muted select-none',
  'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none',
  'aria-pressed:border-brand-weak aria-pressed:bg-brand-weak aria-pressed:text-brand',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
])

function Chip({ className, ...props }: ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root data-slot="chip" className={cn(chipVariants({ className }))} {...props} />
  )
}

export { Chip, chipVariants }

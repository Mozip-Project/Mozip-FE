'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function Toggle({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="toggle"
      className={cn(
        'group relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-gray-300 p-[3px]',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
        'after:absolute after:-inset-x-3 after:-inset-y-2',
        'aria-checked:bg-brand-solid',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="toggle-thumb"
        className="pointer-events-none block size-4.5 rounded-full bg-layer-floating transition-transform group-aria-checked:translate-x-4 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Toggle }

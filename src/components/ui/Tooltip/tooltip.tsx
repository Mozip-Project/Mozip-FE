'use client'

import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type { ComponentProps, ReactElement } from 'react'

const SHOW_DELAY_MS = 300
// Figma 미정의
const TRIGGER_OFFSET_PX = 4

type TooltipProps = Pick<ComponentProps<typeof TooltipPrimitive.Root>, 'open' | 'onOpenChange'> & {
  label: string
  side?: 'top' | 'bottom'
  sideOffset?: number
  children: ReactElement
}

function Tooltip({
  label,
  side = 'top',
  sideOffset = TRIGGER_OFFSET_PX,
  open,
  onOpenChange,
  children,
}: TooltipProps) {
  return (
    // 전역 Provider 대신 툴팁별 Provider
    <TooltipPrimitive.Provider delayDuration={SHOW_DELAY_MS}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip"
            side={side}
            sideOffset={sideOffset}
            className="z-50 rounded-s bg-neutral-solid px-padding-xs py-padding-xxs text-caption1 font-medium whitespace-nowrap text-on-neutral-solid duration-100 motion-safe:animate-in motion-safe:fade-in-0 data-[state=closed]:motion-safe:animate-out data-[state=closed]:motion-safe:fade-out-0"
          >
            {label}
            <TooltipPrimitive.Arrow
              width={10}
              height={5}
              className="fill-(--background-color-neutral-solid)"
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Tooltip }

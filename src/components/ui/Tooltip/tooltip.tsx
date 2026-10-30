'use client'

import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type { ReactElement } from 'react'

// Figma 기준 노출 지연
const SHOW_DELAY_MS = 300
// 화살표 끝과 트리거 사이 간격, Figma 미정의
const TRIGGER_OFFSET_PX = 4

type TooltipProps = {
  label: string
  side?: 'top' | 'bottom'
  children: ReactElement
}

function Tooltip({ label, side = 'top', children }: TooltipProps) {
  return (
    // 전역 Provider 없이 툴팁마다 지연 시간 적용
    <TooltipPrimitive.Provider delayDuration={SHOW_DELAY_MS}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            data-slot="tooltip"
            side={side}
            sideOffset={TRIGGER_OFFSET_PX}
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

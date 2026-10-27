'use client'

import { Popover as PopoverPrimitive } from 'radix-ui'
import { useId, type ComponentProps, type ReactNode } from 'react'
import CloseIcon from '@/assets/icons/close.svg'
import { cn } from '@/lib/utils'

type InfoPopoverProps = Omit<ComponentProps<typeof PopoverPrimitive.Content>, 'title'> & {
  // 팝오버를 여는 요소. Radix Trigger의 asChild로 전달
  trigger: ReactNode
  title: string
  // 줄바꿈 문자(\n)를 그대로 줄로 표시
  description: string
}

function InfoPopover({
  trigger,
  title,
  description,
  className,
  align = 'start',
  sideOffset = 4,
  ...props
}: InfoPopoverProps) {
  const titleId = useId()

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="info-popover"
          aria-labelledby={titleId}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            'z-50 flex max-w-(--radix-popover-content-available-width) min-w-70 flex-col gap-gap-xs rounded-l border border-neutral-subtle bg-layer-floating px-padding-m pt-padding-s pb-padding-m shadow-floating outline-none',
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-gap-s">
            <p
              id={titleId}
              className="min-w-0 flex-1 text-body1 font-semibold break-words text-neutral"
            >
              {title}
            </p>
            <PopoverPrimitive.Close
              aria-label="닫기"
              className={cn(
                'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral-muted',
                'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
              )}
            >
              <CloseIcon aria-hidden />
            </PopoverPrimitive.Close>
          </div>
          <p className="text-label1 break-words whitespace-pre-line text-neutral-muted">
            {description}
          </p>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { InfoPopover }

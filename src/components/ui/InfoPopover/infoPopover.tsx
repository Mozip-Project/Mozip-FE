'use client'

import { useId, type ComponentProps, type ReactElement } from 'react'
import CloseIcon from '@/assets/icons/close.svg'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover/popover'
import { cn } from '@/lib/utils'

type InfoPopoverProps = Omit<ComponentProps<typeof PopoverContent>, 'title'> & {
  trigger: ReactElement
  title: string
  description: string
}

function InfoPopover({
  trigger,
  title,
  description,
  className,
  sideOffset = 4,
  ...props
}: InfoPopoverProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        data-slot="info-popover"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        sideOffset={sideOffset}
        className={cn(
          'flex min-w-70 flex-col gap-gap-xs px-padding-m pt-padding-s pb-padding-m',
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
          <PopoverClose
            aria-label="닫기"
            className={cn(
              'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral-muted',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
            )}
          >
            <CloseIcon aria-hidden />
          </PopoverClose>
        </div>
        <p
          id={descriptionId}
          className="text-label1 break-words break-keep whitespace-pre-line text-neutral-muted"
        >
          {description}
        </p>
      </PopoverContent>
    </Popover>
  )
}

export { InfoPopover }

'use client'

import { Dialog as DialogPrimitive, Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogContent({ className, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      {/* 긴 내용 스크롤용 overlay 안 배치 */}
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-overlay-muted px-page-padding py-25"
      >
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            'flex w-115 max-w-full min-w-70 shrink-0 flex-col items-center gap-gap-xl rounded-xl bg-layer-default p-padding-xl shadow-floating outline-none',
            className,
          )}
          {...props}
        />
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

type DialogHeaderProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
}

function DialogHeader({ title, description, icon }: DialogHeaderProps) {
  return (
    <div data-slot="dialog-header" className="flex w-full flex-col items-center gap-gap-l">
      {icon && (
        <span
          aria-hidden
          className="flex rounded-full bg-brand-weak p-padding-s text-brand [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <div className="flex w-full flex-col gap-gap-xxs text-center break-words break-keep">
        <DialogPrimitive.Title className="text-heading2 font-bold text-neutral">
          {title}
        </DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description className="text-body2 font-normal text-neutral-muted">
            {description}
          </DialogPrimitive.Description>
        )}
      </div>
    </div>
  )
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex w-full gap-gap-s *:min-w-0 *:flex-1', className)}
      {...props}
    />
  )
}

function DialogSummary({ className, ...props }: ComponentProps<'dl'>) {
  return (
    <dl
      data-slot="dialog-summary"
      className={cn(
        'flex w-full flex-col gap-gap-s rounded-m bg-neutral-weak px-padding-m py-padding-s',
        '*:not-first:border-t *:not-first:border-neutral-subtle *:not-first:pt-gap-s',
        className,
      )}
      {...props}
    />
  )
}

type DialogProgressProps = {
  label: string
  valueText: string
  value: number
  max: number
}

function DialogProgress({ label, valueText, value, max }: DialogProgressProps) {
  const percent = max > 0 ? Math.min(value / max, 1) * 100 : 0

  return (
    <div data-slot="dialog-progress" className="flex w-full flex-col gap-gap-s">
      <div className="flex gap-gap-s text-label1 whitespace-nowrap">
        <span className="min-w-0 flex-1 truncate font-medium text-neutral-muted">{label}</span>
        <span className="shrink-0 font-semibold text-neutral">{valueText}</span>
      </div>
      <ProgressPrimitive.Root
        value={value}
        max={max}
        aria-label={label}
        aria-valuetext={valueText}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-weak"
      >
        {/* 런타임 값이라 style 사용 */}
        <ProgressPrimitive.Indicator
          className="size-full rounded-full bg-brand-solid"
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProgress,
  DialogSummary,
  DialogTrigger,
}

'use client'

import { Dialog as DialogPrimitive, Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

// Content가 modal 전용 Overlay 안에 있어 비모달 미지원
function Dialog(props: Omit<ComponentProps<typeof DialogPrimitive.Root>, 'modal'>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  // 큰 팝업의 화면 위아래 여백 조정용
  overlayClassName?: string
}

function DialogContent({ className, overlayClassName, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      {/* 긴 내용 스크롤용 overlay 안 배치 */}
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-overlay-muted px-page-padding py-25',
          overlayClassName,
        )}
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
      <div className="flex w-full flex-col gap-gap-s text-center break-words break-keep">
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

// 가운데 정렬 DialogHeader와 다른 배치의 팝업에서 제목·설명 연결용
function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" {...props} />
}

function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" {...props} />
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

const SUMMARY_ROW_TONE_CLASS = {
  default: 'text-neutral',
  positive: 'text-positive',
  critical: 'text-critical',
  subtle: 'text-neutral-subtle',
} satisfies Record<string, string>

type DialogSummaryRowProps = {
  label: string
  children: ReactNode
  tone?: keyof typeof SUMMARY_ROW_TONE_CLASS
}

// DialogSummary 안 라벨·값 한 줄
function DialogSummaryRow({ label, children, tone = 'default' }: DialogSummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-gap-s">
      <dt className="min-w-0 text-label2 font-normal text-neutral-subtle">{label}</dt>
      <dd
        className={cn('shrink-0 text-right text-label1 font-medium', SUMMARY_ROW_TONE_CLASS[tone])}
      >
        {children}
      </dd>
    </div>
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProgress,
  DialogSummary,
  DialogSummaryRow,
  DialogTitle,
  DialogTrigger,
}

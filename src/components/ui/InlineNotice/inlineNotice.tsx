import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import CheckIcon from '@/assets/icons/check.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import InfoIcon from '@/assets/icons/info.svg'
import LockIcon from '@/assets/icons/lock.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps, ReactNode } from 'react'

const INLINE_NOTICE_TONES = ['neutral', 'critical', 'warning', 'positive', 'informative'] as const

type InlineNoticeTone = (typeof INLINE_NOTICE_TONES)[number]

const TONE_STYLES = {
  neutral: { Icon: LockIcon, box: 'bg-neutral-weak', text: 'text-neutral-muted', row: 'gap-gap-m' },
  critical: {
    Icon: AlertCircleIcon,
    box: 'bg-critical-weak',
    text: 'text-critical',
    row: 'gap-gap-m',
  },
  warning: {
    Icon: AlertCircleIcon,
    box: 'bg-warning-weak',
    text: 'text-warning',
    row: 'gap-gap-m',
  },
  positive: { Icon: CheckIcon, box: 'bg-positive-weak', text: 'text-positive', row: 'gap-gap-s' },
  informative: {
    Icon: InfoIcon,
    box: 'bg-informative-weak',
    text: 'text-informative',
    row: 'gap-gap-xs',
  },
} satisfies Record<InlineNoticeTone, object>

type InlineNoticeProps = Omit<ComponentProps<'div'>, 'title'> & {
  tone: InlineNoticeTone
  title?: ReactNode
  action?: ReactNode
}

function InlineNotice({ tone, title, action, children, className, ...props }: InlineNoticeProps) {
  const { Icon, box, text, row } = TONE_STYLES[tone]

  return (
    <div
      data-slot="inline-notice"
      data-tone={tone}
      className={cn('flex items-center gap-gap-m rounded-m p-padding-s', box, className)}
      {...props}
    >
      <div className={cn('flex min-w-0 flex-1 items-center', row)}>
        <Icon aria-hidden className={cn('size-4 shrink-0', text)} />
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs break-words break-keep">
          {title && <p className="text-label2 font-semibold text-neutral">{title}</p>}
          <p className={cn('text-caption1 font-medium', text)}>{children}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

function InlineNoticeAction({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      data-slot="inline-notice-action"
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-gap-xs rounded-s text-label1 font-semibold whitespace-nowrap text-neutral-muted',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon aria-hidden className="size-4 text-neutral" />
    </button>
  )
}

export { INLINE_NOTICE_TONES, InlineNotice, InlineNoticeAction }
export type { InlineNoticeTone }

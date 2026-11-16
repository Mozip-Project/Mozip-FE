import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import CheckIcon from '@/assets/icons/check.svg'
import InfoIcon from '@/assets/icons/info.svg'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const SUMMARY_BAR_STATUSES = ['blocked', 'ready', 'next'] as const

type SummaryBarStatus = (typeof SUMMARY_BAR_STATUSES)[number]

const STATUS_ICON = {
  blocked: { Icon: AlertCircleIcon, color: 'text-warning' },
  ready: { Icon: InfoIcon, color: 'text-neutral-subtle' },
  next: { Icon: CheckIcon, color: 'text-positive' },
} satisfies Record<SummaryBarStatus, object>

type SummaryBarProps = {
  status: SummaryBarStatus
  children: ReactNode
  link?: ReactNode
  actions: ReactNode
  // 조작 결과로 문구가 바뀌는 곳만 화면 리더에 알림, 고정된 안내는 false
  shouldAnnounce?: boolean
  className?: string
}

function SummaryBar({
  status,
  children,
  link,
  actions,
  shouldAnnounce = true,
  className,
}: SummaryBarProps) {
  const { Icon, color } = STATUS_ICON[status]

  return (
    <div
      data-slot="summary-bar"
      data-status={status}
      className={cn(
        'flex flex-wrap items-center gap-gap-l rounded-l border border-neutral-subtle bg-layer-default px-padding-xl py-padding-m shadow-floating',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-gap-s">
        <p
          role={shouldAnnounce ? 'status' : undefined}
          className="flex min-w-0 items-center gap-gap-s"
        >
          <Icon aria-hidden className={cn('size-5 shrink-0', color)} />
          <span className="text-body1 font-semibold break-keep text-neutral">{children}</span>
        </p>
        {link}
      </div>
      <div className="ml-auto flex max-w-full flex-wrap justify-end gap-gap-m">{actions}</div>
    </div>
  )
}

export { SUMMARY_BAR_STATUSES, SummaryBar }
export type { SummaryBarStatus }

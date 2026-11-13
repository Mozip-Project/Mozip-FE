import { Badge } from '@/components/ui/Badge/badge'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const BANNER_TONES = ['informative', 'critical'] as const

type BannerTone = (typeof BANNER_TONES)[number]

const BANNER_TONE_CLASS = {
  informative: 'bg-informative-weak',
  critical: 'bg-critical-weak',
} satisfies Record<BannerTone, string>

type BannerUsage = {
  label: string
  value: string
}

type BannerProps = {
  title: string
  description: string
  tone?: BannerTone
  badgeLabel?: string
  usage?: BannerUsage
  action?: ReactNode
  className?: string
}

function Banner({
  title,
  description,
  tone = 'informative',
  badgeLabel,
  usage,
  action,
  className,
}: BannerProps) {
  return (
    // Figma 미정의 모바일은 세로 배치
    <div
      data-slot="banner"
      className={cn(
        'flex flex-col items-start gap-gap-l rounded-l px-padding-xl py-padding-l tablet:min-h-22 tablet:flex-row tablet:items-center tablet:py-padding-m',
        BANNER_TONE_CLASS[tone],
        className,
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-gap-xs tablet:flex-1">
        <div className="flex items-center gap-gap-s">
          <p className="min-w-0 text-headline2 font-semibold break-keep text-neutral">{title}</p>
          {badgeLabel && <Badge tone="informative">{badgeLabel}</Badge>}
        </div>
        <p className="text-label1 font-normal break-keep text-neutral-subtle">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        {usage && (
          <dl className="flex items-center gap-gap-xs whitespace-nowrap">
            <dt className="text-label2 font-normal text-neutral-subtle">{usage.label}</dt>
            <dd className="text-body2 font-medium text-neutral">{usage.value}</dd>
          </dl>
        )}
        {action}
      </div>
    </div>
  )
}

export { Banner, BANNER_TONES }

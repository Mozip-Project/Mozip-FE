import InfoIcon from '@/assets/icons/info.svg'
import { cn } from '@/lib/utils'

const CALLOUT_TONES = ['neutral', 'informative'] as const

type CalloutTone = (typeof CALLOUT_TONES)[number]

const TONE_CLASS = {
  neutral: { box: 'bg-neutral-weak', icon: 'text-neutral-subtle' },
  informative: { box: 'bg-informative-weak', icon: 'text-informative' },
} satisfies Record<CalloutTone, { box: string; icon: string }>

type CalloutProps = {
  title: string
  items?: readonly string[]
  tone?: CalloutTone
  className?: string
}

function Callout({ title, items, tone = 'neutral', className }: CalloutProps) {
  const hasItems = items !== undefined && items.length > 0

  return (
    <div
      data-slot="callout"
      className={cn(
        'flex flex-col gap-gap-m rounded-m px-padding-l py-padding-m',
        TONE_CLASS[tone].box,
        className,
      )}
    >
      {/* 목록 없는 한 줄 안내는 Figma 기준 Medium */}
      <p
        className={cn(
          'flex items-center gap-gap-s text-body2 text-neutral',
          hasItems ? 'font-semibold' : 'font-medium',
        )}
      >
        <InfoIcon aria-hidden className={cn('size-4 shrink-0', TONE_CLASS[tone].icon)} />
        <span className="min-w-0 break-words break-keep">{title}</span>
      </p>
      {hasItems && (
        // Safari VoiceOver 목록 인식용 role
        <ul
          role="list"
          className="flex flex-col gap-gap-xs text-label1 font-normal text-neutral-muted"
        >
          {items.map((item) => (
            <li key={item} className="flex gap-1.5">
              <span aria-hidden className="w-2 shrink-0">
                •
              </span>
              <span className="min-w-0 flex-1 break-words break-keep">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { Callout, CALLOUT_TONES }
export type { CalloutTone }

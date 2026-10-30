import InfoIcon from '@/assets/icons/info.svg'
import { cn } from '@/lib/utils'

type CalloutProps = {
  title: string
  items: readonly string[]
  className?: string
}

function Callout({ title, items, className }: CalloutProps) {
  return (
    <div
      data-slot="callout"
      className={cn(
        'flex flex-col gap-gap-m rounded-m bg-neutral-weak px-padding-l py-padding-m',
        className,
      )}
    >
      <p className="flex items-center gap-gap-s text-body2 font-semibold text-neutral">
        <InfoIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
        <span className="min-w-0 break-words break-keep">{title}</span>
      </p>
      {/* list-style: none이면 Safari VoiceOver가 목록으로 읽지 않아 role 명시 */}
      <ul
        role="list"
        className="flex flex-col gap-gap-xs text-label1 font-normal text-neutral-muted"
      >
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            {/* 목록 구조로 항목 구분이 전달되어 글머리표는 보조 기술에서 제외 */}
            <span aria-hidden className="w-2 shrink-0">
              •
            </span>
            <span className="min-w-0 flex-1 break-words break-keep">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { Callout }

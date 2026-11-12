import { Badge } from '@/components/ui/Badge/badge'
import type { ManagedPostingDetail } from '@/features/posting/types'
import { getPostingDetailRows } from '@/features/posting/utils/postingDetailRows'

type PostingDetailCardProps = {
  detail: ManagedPostingDetail
}

function PostingDetailCard({ detail }: PostingDetailCardProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-gap-m rounded-l border border-neutral-muted bg-layer-default p-padding-xl desktop:self-stretch">
      <div className="flex items-center justify-between gap-gap-s">
        <h2 className="text-body1 font-semibold text-neutral">공고 상세 내용</h2>
        <Badge tone="warning" variant="weak">
          {detail.postingDeadlineLabel}
        </Badge>
      </div>
      <dl className="flex flex-col gap-gap-s">
        {getPostingDetailRows(detail).map(({ label, value }) => (
          <div key={label} className="flex items-center gap-gap-l">
            <dt className="w-40 shrink-0 text-label1 font-semibold break-keep text-neutral-subtle">
              {label}
            </dt>
            <dd className="min-w-0 flex-1 text-body2 break-words break-keep text-neutral">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export { PostingDetailCard }

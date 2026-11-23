import type { PostingDetail } from '@/features/posting/types'
import { getPostingFactRows, getPostingScheduleRows } from '@/features/posting/utils/postingDetail'
import { PostingInfoRow } from './postingInfoRow'

type PostingSummaryProps = {
  detail: PostingDetail
}

function PostingSummary({ detail }: PostingSummaryProps) {
  return (
    <div className="flex flex-col gap-padding-l py-padding-l">
      <dl className="flex flex-col gap-gap-m">
        {getPostingFactRows(detail).map(({ label, value }) => (
          <PostingInfoRow key={label} label={label}>
            {value}
          </PostingInfoRow>
        ))}
      </dl>
      <dl className="flex flex-col gap-gap-m border-t border-neutral-subtle pt-padding-l">
        {getPostingScheduleRows(detail).map(({ label, value }) => (
          <PostingInfoRow key={label} label={label}>
            {value}
          </PostingInfoRow>
        ))}
      </dl>
    </div>
  )
}

export { PostingSummary }

import { Fragment } from 'react'
import type { PostingDetail, PostingPosition } from '@/features/posting/types'
import { getPostingFactRows, getPostingScheduleRows } from '@/features/posting/utils/postingDetail'
import { PostingInfoRow } from './postingInfoRow'

type PostingSummaryProps = {
  detail: PostingDetail
}

function renderPositionNames(positions: readonly PostingPosition[]) {
  return positions.map(({ id, name, appliedAt }, index) => (
    <Fragment key={id}>
      {index > 0 && ', '}
      {name}
      {appliedAt !== null && <span className="text-placeholder"> (지원 완료)</span>}
    </Fragment>
  ))
}

function PostingSummary({ detail }: PostingSummaryProps) {
  return (
    <div className="flex flex-col gap-padding-l py-padding-l">
      <dl className="flex flex-col gap-gap-m">
        {getPostingFactRows(detail).map((row) => (
          <PostingInfoRow key={row.label} label={row.label}>
            {'positions' in row ? renderPositionNames(row.positions) : row.value}
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

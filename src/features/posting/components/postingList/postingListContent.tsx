import { JobCard } from '@/components/ui/JobCard/jobCard'
import type { ComponentProps, ReactNode } from 'react'

type PostingListItem = ComponentProps<typeof JobCard> & {
  id: string
}

type PostingListContentProps = {
  // 필터가 반영된 공고 수
  totalCount: number
  postings: readonly PostingListItem[]
  // 개수 오른쪽 정렬, 개수 아래 적용된 필터, 목록 아래 페이지 이동
  sortControl?: ReactNode
  appliedFilters?: ReactNode
  pagination?: ReactNode
}

function PostingListContent({
  totalCount,
  postings,
  sortControl,
  appliedFilters,
  pagination,
}: PostingListContentProps) {
  return (
    <div className="flex flex-col gap-gap-xl">
      <section className="flex flex-col gap-gap-l">
        <h2 className="sr-only">공고 목록</h2>
        <div className="flex items-center justify-between gap-gap-l">
          {/* 화면 이동 없이 조건이 바뀌어 결과 수를 화면 리더에 안내 */}
          <p role="status" className="text-body2 font-medium text-neutral">
            총 {totalCount.toLocaleString('ko-KR')}건
          </p>
          {sortControl}
        </div>
        {appliedFilters}
        <ul className="grid grid-cols-3 gap-gap-xl">
          {postings.map(({ id, ...posting }) => (
            <li key={id}>
              <JobCard {...posting} />
            </li>
          ))}
        </ul>
      </section>
      {pagination}
    </div>
  )
}

export { PostingListContent }
export type { PostingListItem }

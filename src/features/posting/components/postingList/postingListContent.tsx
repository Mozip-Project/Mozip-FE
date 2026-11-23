import FileTextIcon from '@/assets/icons/fileText.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { JobCard } from '@/components/ui/JobCard/jobCard'
import type { PostingListItem } from '@/features/posting/types'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import type { ReactNode } from 'react'

type PostingListContentProps = {
  totalCount: number
  postings: readonly PostingListItem[]
  pagination: ReactNode
}

function PostingListContent({ totalCount, postings, pagination }: PostingListContentProps) {
  return (
    <div className="flex flex-col gap-gap-xl">
      {postings.length > 0 ? (
        <ul className="grid grid-cols-3 gap-gap-xl">
          {postings.map(({ id, phase, ...posting }) => (
            <li key={id}>
              <JobCard {...posting} badge={<Badge {...getRecruitmentStatusBadgeProps(phase)} />} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<FileTextIcon className="size-7" />}
          title="조건에 맞는 결과가 없어요"
          description="검색 조건을 변경하거나 필터를 초기화해 보세요"
          className="min-h-162.5 justify-center border-0"
        />
      )}
      {/* 없는 페이지 번호로 들어와도 다른 페이지로 이동할 수 있게 결과가 있으면 표시 */}
      {totalCount > 0 && pagination}
    </div>
  )
}

export { PostingListContent }

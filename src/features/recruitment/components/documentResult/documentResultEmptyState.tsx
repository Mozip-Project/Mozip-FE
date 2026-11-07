import SearchIcon from '@/assets/icons/search.svg'
import { RecruitmentBoardFilterEmptyState } from '@/features/recruitment/components/recruitmentBoard/recruitmentBoardFilterEmptyState'
import { RecruitmentBoardSearchEmptyState } from '@/features/recruitment/components/recruitmentBoard/recruitmentBoardSearchEmptyState'
import type { DocumentResultQuery } from '@/features/recruitment/types'
import { getDocumentResultFilterEmptyDescription } from '@/features/recruitment/utils/documentResult'

type DocumentResultEmptyStateProps = {
  query: Pick<DocumentResultQuery, 'status' | 'positions'>
  keyword: string
  // 필터·검색 적용 후 전체 탭 인원
  totalCount: number
}

// 검색 결과가 모든 탭에서 0명일 때만 검색 안내, 그 외에는 탭·포지션 조건 안내
function DocumentResultEmptyState({ query, keyword, totalCount }: DocumentResultEmptyStateProps) {
  const isSearchEmpty = keyword !== '' && totalCount === 0

  if (isSearchEmpty) {
    return <RecruitmentBoardSearchEmptyState keyword={keyword} clearLabel="검색어 지우기" />
  }

  return (
    <RecruitmentBoardFilterEmptyState
      icon={<SearchIcon className="size-7" />}
      description={getDocumentResultFilterEmptyDescription(query)}
    />
  )
}

export { DocumentResultEmptyState }

'use client'

import { useParams, useSearchParams } from 'next/navigation'
import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
  type RecruitmentBoardTab,
} from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoard'
import { useApplicantManagement } from '@/features/recruitment/hooks/useApplicantManagement'
import {
  APPLICANT_ALL_POSITIONS_TAB,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  type ApplicantManagementPage,
  type ApplicantManagementQuery,
  type ApplicantPositionTab,
  type DocumentReviewSort,
} from '@/features/recruitment/types'
import {
  getApplicantManagementHref,
  parseApplicantManagementQuery,
} from '@/features/recruitment/utils/applicantManagementQuery'
import { getBoardSortOptions } from '@/features/recruitment/utils/boardQuery'
import {
  ApplicantManagementEmptyState,
  ApplicantManagementLoadError,
} from './applicantManagementEmptyState'
import {
  ApplicantManagementSkeletonTable,
  ApplicantManagementTable,
} from './applicantManagementTable'
import type { Route } from 'next'

const HEADER = { title: '지원자 관리' }
const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_REVIEW_SORTS, DOCUMENT_REVIEW_SORT_LABEL)
const SORT_MENU_SIDE_OFFSET_PX = 8

// 포지션은 조회 후에 알 수 있어 첫 진입 로딩 중에는 전체 탭만 표시
const LOADING_POSITION_TABS: readonly RecruitmentBoardTab<ApplicantPositionTab>[] = [
  { value: APPLICANT_ALL_POSITIONS_TAB, label: '전체', count: null },
]

// 서류 평가 취합의 결과 확정 뒤 함께 갱신하도록 클라이언트에서 조회
function ApplicantManagementContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const query = parseApplicantManagementQuery(useSearchParams())
  const { data, isError, isPlaceholderData } = useApplicantManagement(postingId, query)
  const columns = data && { hasInterview: data.hasInterview, hasPositions: data.hasPositions }

  function handlePageNavigate(href: Route) {
    window.history.pushState(null, '', href)
  }

  // 목록 조건은 URL에만 두고 서버 렌더링 없이 갱신, 조건 변경 시 1페이지로
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<ApplicantPositionTab, DocumentReviewSort>,
  ) {
    const nextQuery = { ...query, ...change, page: 1 }
    window.history.replaceState(null, '', getApplicantManagementHref(postingId, nextQuery))
  }

  return (
    <RecruitmentBoard
      header={HEADER}
      isHeaderSticky
      query={query}
      statusTabs={data?.positionTabs ?? LOADING_POSITION_TABS}
      tabsLabel="지원 파트"
      sortOptions={SORT_OPTIONS}
      sortMenuSideOffset={SORT_MENU_SIDE_OFFSET_PX}
      canFilterPosition={false}
      currentPage={data?.currentPage ?? query.page}
      totalPages={data?.totalPages ?? 0}
      isPending={isPlaceholderData}
      skeleton={<ApplicantManagementSkeletonTable columns={columns} />}
      shouldShowSinglePage
      shouldHidePaginationWhilePending
      getPageHref={(page) => getApplicantManagementHref(postingId, { ...query, page })}
      onQueryChange={handleQueryChange}
      onPageNavigate={handlePageNavigate}
    >
      <ApplicantManagementList data={data} isError={isError} query={query} />
    </RecruitmentBoard>
  )
}

type ApplicantManagementListProps = {
  data: ApplicantManagementPage | undefined
  isError: boolean
  query: ApplicantManagementQuery
}

// 이전 목록이 없는 실패만 실패 화면, 조회 중은 스켈레톤
function ApplicantManagementList({ data, isError, query }: ApplicantManagementListProps) {
  if (isError) {
    return <ApplicantManagementLoadError />
  }

  if (!data) {
    return (
      <div className="animate-skeleton-delayed-show">
        <ApplicantManagementSkeletonTable />
      </div>
    )
  }

  return (
    <ApplicantManagementTable
      applicants={data.applicants}
      columns={{ hasInterview: data.hasInterview, hasPositions: data.hasPositions }}
      resultPhase={data.resultPhase}
      emptyState={
        <ApplicantManagementEmptyState
          keyword={query.keyword.trim()}
          isPositionSelected={query.status !== APPLICANT_ALL_POSITIONS_TAB}
        />
      }
    />
  )
}

// Suspense 정적 셸용, 조작은 막고 제목만 표시
function ApplicantManagementContentFallback() {
  const query = parseApplicantManagementQuery({})

  return (
    <RecruitmentBoard
      header={HEADER}
      isHeaderSticky
      query={query}
      statusTabs={LOADING_POSITION_TABS}
      tabsLabel="지원 파트"
      sortOptions={SORT_OPTIONS}
      sortMenuSideOffset={SORT_MENU_SIDE_OFFSET_PX}
      canFilterPosition={false}
      currentPage={1}
      totalPages={0}
      isPending={false}
      skeleton={null}
      shouldShowSinglePage
      shouldHidePaginationWhilePending
      getPageHref={(page) => getApplicantManagementHref('', { ...query, page })}
      onQueryChange={() => {}}
      onPageNavigate={() => {}}
      isPlaceholder
    >
      <div className="animate-skeleton-delayed-show">
        <ApplicantManagementSkeletonTable />
      </div>
    </RecruitmentBoard>
  )
}

export { ApplicantManagementContent, ApplicantManagementContentFallback }

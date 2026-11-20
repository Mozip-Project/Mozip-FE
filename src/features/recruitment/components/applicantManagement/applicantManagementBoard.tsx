'use client'

import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/components/recruitmentBoard/recruitmentBoard'
import {
  APPLICANT_POSITION_TAB_LABEL,
  APPLICANT_POSITION_TABS,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  type ApplicantManagementQuery,
  type ApplicantPositionTab,
  type DocumentReviewSort,
} from '@/features/recruitment/types'
import {
  getApplicantManagementHref,
  parseApplicantManagementQuery,
} from '@/features/recruitment/utils/applicantManagementQuery'
import { getBoardSortOptions, getBoardStatusTabs } from '@/features/recruitment/utils/boardQuery'
import { ApplicantManagementSkeletonTable } from './applicantManagementTable'
import type { Route } from 'next'
import type { ReactNode } from 'react'

const HEADER = { title: '지원자 관리' }

const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_REVIEW_SORTS, DOCUMENT_REVIEW_SORT_LABEL)
const SORT_MENU_SIDE_OFFSET_PX = 8

type ApplicantManagementBoardProps = {
  postingId: string
  query: ApplicantManagementQuery
  // null은 첫 진입 로딩 중
  tabCounts: Record<ApplicantPositionTab, number> | null
  currentPage: number
  totalPages: number
  isPending?: boolean
  // 조건 변경 중 스켈레톤 열 구성용, 첫 진입 로딩은 면접 모집 기준
  hasInterview?: boolean
  summary?: ReactNode
  children: ReactNode
  isPlaceholder?: boolean
}

function ApplicantManagementBoard({
  postingId,
  query,
  tabCounts,
  currentPage,
  totalPages,
  isPending = false,
  hasInterview = true,
  summary,
  children,
  isPlaceholder,
}: ApplicantManagementBoardProps) {
  function handlePageNavigate(href: Route) {
    window.history.pushState(null, '', href)
  }

  // 목록 조건은 URL에만 두고 서버 렌더링 없이 갱신, 탭·검색·정렬이 바뀌면 1페이지로
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<ApplicantPositionTab, DocumentReviewSort>,
  ) {
    const nextQuery = { ...query, ...change, page: 1 }
    window.history.replaceState(null, '', getApplicantManagementHref(postingId, nextQuery))
  }

  return (
    <RecruitmentBoard
      header={HEADER}
      summary={summary}
      query={query}
      statusTabs={getBoardStatusTabs(
        APPLICANT_POSITION_TABS,
        APPLICANT_POSITION_TAB_LABEL,
        tabCounts,
      )}
      tabsLabel="지원 파트"
      sortOptions={SORT_OPTIONS}
      sortMenuSideOffset={SORT_MENU_SIDE_OFFSET_PX}
      positionCounts={null}
      canFilterPosition={false}
      isPending={isPending}
      skeleton={<ApplicantManagementSkeletonTable hasInterview={hasInterview} />}
      currentPage={currentPage}
      totalPages={totalPages}
      shouldShowSinglePage
      shouldHidePaginationWhilePending
      getPageHref={(page) => getApplicantManagementHref(postingId, { ...query, page })}
      onQueryChange={handleQueryChange}
      onPageNavigate={handlePageNavigate}
      isPlaceholder={isPlaceholder}
    >
      {children}
    </RecruitmentBoard>
  )
}

function ApplicantManagementBoardPlaceholder({ children }: { children: ReactNode }) {
  return (
    <ApplicantManagementBoard
      postingId=""
      query={parseApplicantManagementQuery({})}
      tabCounts={null}
      currentPage={1}
      totalPages={0}
      isPlaceholder
    >
      {children}
    </ApplicantManagementBoard>
  )
}

export { ApplicantManagementBoard, ApplicantManagementBoardPlaceholder }

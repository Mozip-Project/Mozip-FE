'use client'

import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
  type RecruitmentBoardTab,
} from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoard'
import {
  APPLICANT_ALL_POSITIONS_TAB,
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
import { getBoardSortOptions } from '@/features/recruitment/utils/boardQuery'
import {
  ApplicantManagementSkeletonTable,
  type ApplicantTableColumns,
} from './applicantManagementTable'
import type { Route } from 'next'
import type { ReactNode } from 'react'

const HEADER = { title: '지원자 관리' }

const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_REVIEW_SORTS, DOCUMENT_REVIEW_SORT_LABEL)
const SORT_MENU_SIDE_OFFSET_PX = 8

// 포지션은 조회 후에 알 수 있어 첫 진입 로딩 중에는 전체 탭만 표시
const LOADING_POSITION_TABS: readonly RecruitmentBoardTab<ApplicantPositionTab>[] = [
  { value: APPLICANT_ALL_POSITIONS_TAB, label: '전체', count: null },
]

type ApplicantManagementBoardProps = {
  postingId: string
  query: ApplicantManagementQuery
  // null은 첫 진입 로딩 중
  positionTabs: readonly RecruitmentBoardTab<ApplicantPositionTab>[] | null
  currentPage: number
  totalPages: number
  isPending?: boolean
  // 조건 변경 중 스켈레톤 열 구성용, 생략하면 파트·면접이 모두 있는 모집 기준
  columns?: ApplicantTableColumns
  children: ReactNode
  isPlaceholder?: boolean
}

function ApplicantManagementBoard({
  postingId,
  query,
  positionTabs,
  currentPage,
  totalPages,
  isPending = false,
  columns,
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
      isHeaderSticky
      query={query}
      statusTabs={positionTabs ?? LOADING_POSITION_TABS}
      tabsLabel="지원 파트"
      sortOptions={SORT_OPTIONS}
      sortMenuSideOffset={SORT_MENU_SIDE_OFFSET_PX}
      positionCounts={null}
      canFilterPosition={false}
      isPending={isPending}
      skeleton={<ApplicantManagementSkeletonTable columns={columns} />}
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
      positionTabs={null}
      currentPage={1}
      totalPages={0}
      isPlaceholder
    >
      {children}
    </ApplicantManagementBoard>
  )
}

export { ApplicantManagementBoard, ApplicantManagementBoardPlaceholder }

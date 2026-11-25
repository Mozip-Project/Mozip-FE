'use client'

import { useParams, useSearchParams } from 'next/navigation'
import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoard'
import { RecruitmentBoardLoadError } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardLoadError'
import { useDocumentReview } from '@/features/recruitment/hooks/useDocumentReview'
import {
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewApplicantPage,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
} from '@/features/recruitment/types'
import { getBoardSortOptions, getBoardStatusTabs } from '@/features/recruitment/utils/boardQuery'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import {
  DocumentReviewApplicantTable,
  DocumentReviewSkeletonTable,
} from './documentReviewApplicantTable'
import { DocumentReviewEmptyState } from './documentReviewEmptyState'
import type { Route } from 'next'

const HEADER = { title: '서류 평가' }
const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_REVIEW_SORTS, DOCUMENT_REVIEW_SORT_LABEL)

function DocumentReviewContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const query = parseDocumentReviewQuery(useSearchParams())
  const { data, isError, isPlaceholderData, startReviewHref } = useDocumentReview(postingId, query)
  const positionOptions = data?.positionOptions ?? []
  const hasPositions = data?.hasPositions ?? true

  function handlePageNavigate(href: Route) {
    window.history.pushState(null, '', href)
  }

  // 목록 조건은 URL에만 두고 서버 렌더링 없이 갱신, 조건 변경 시 1페이지로
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<DocumentReviewStatus, DocumentReviewSort, string>,
  ) {
    let positions = query.positions
    if (change.positions) {
      const selectedPositions = change.positions
      const isAllSelected =
        positionOptions.length > 0 &&
        positionOptions.every((option) => selectedPositions.includes(option.value))
      positions = isAllSelected ? [] : selectedPositions
    }

    const nextQuery = { ...query, ...change, positions, page: 1 }
    window.history.replaceState(null, '', getDocumentReviewHref(postingId, nextQuery))
  }

  return (
    <RecruitmentBoard
      header={HEADER}
      isHeaderSticky
      query={query}
      statusTabs={getBoardStatusTabs(
        DOCUMENT_REVIEW_STATUSES,
        DOCUMENT_REVIEW_STATUS_LABEL,
        data?.statusCounts ?? null,
      )}
      tabsLabel="평가 상태"
      sortOptions={SORT_OPTIONS}
      positionOptions={positionOptions}
      canFilterPosition={hasPositions}
      currentPage={data?.currentPage ?? query.page}
      totalPages={data?.totalPages ?? 0}
      isPending={isPlaceholderData}
      skeleton={<DocumentReviewSkeletonTable hasPositions={hasPositions} />}
      getPageHref={(page) => getDocumentReviewHref(postingId, { ...query, page })}
      onQueryChange={handleQueryChange}
      onPageNavigate={handlePageNavigate}
    >
      <DocumentReviewList
        postingId={postingId}
        data={data}
        isError={isError}
        query={query}
        startReviewHref={startReviewHref}
      />
    </RecruitmentBoard>
  )
}

type DocumentReviewListProps = {
  postingId: string
  data: DocumentReviewApplicantPage | undefined
  isError: boolean
  query: DocumentReviewQuery
  startReviewHref?: Route
}

// 이전 목록이 없는 실패만 실패 화면, 조회 중은 스켈레톤
function DocumentReviewList({
  postingId,
  data,
  isError,
  query,
  startReviewHref,
}: DocumentReviewListProps) {
  if (isError) {
    return <RecruitmentBoardLoadError />
  }

  if (!data) {
    return (
      <div className="animate-skeleton-delayed-show">
        <DocumentReviewSkeletonTable />
      </div>
    )
  }

  return (
    <DocumentReviewApplicantTable
      postingId={postingId}
      applicants={data.applicants}
      hasPositions={data.hasPositions}
      emptyState={
        <DocumentReviewEmptyState
          postingId={postingId}
          status={query.status}
          totalCount={data.statusCounts.all}
          keyword={query.keyword.trim()}
          isPositionFiltered={query.positions.length > 0}
          startReviewHref={startReviewHref}
        />
      }
    />
  )
}

function DocumentReviewContentFallback() {
  const query = parseDocumentReviewQuery({})

  return (
    <RecruitmentBoard
      header={HEADER}
      isHeaderSticky
      query={query}
      statusTabs={getBoardStatusTabs(DOCUMENT_REVIEW_STATUSES, DOCUMENT_REVIEW_STATUS_LABEL, null)}
      tabsLabel="평가 상태"
      sortOptions={SORT_OPTIONS}
      positionOptions={[]}
      currentPage={1}
      totalPages={0}
      isPending={false}
      skeleton={null}
      getPageHref={(page) => getDocumentReviewHref('', { ...query, page })}
      onQueryChange={() => {}}
      onPageNavigate={() => {}}
      isPlaceholder
    >
      <div className="animate-skeleton-delayed-show">
        <DocumentReviewSkeletonTable />
      </div>
    </RecruitmentBoard>
  )
}

export { DocumentReviewContent, DocumentReviewContentFallback }

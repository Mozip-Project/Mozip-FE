'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge/badge'
import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoard'
import { RecruitmentBoardLoadError } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardLoadError'
import { useDocumentResults } from '@/features/recruitment/hooks/useDocumentResults'
import {
  DOCUMENT_RESULT_SORT_LABEL,
  DOCUMENT_RESULT_SORTS,
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULT_STATUSES,
  type DocumentResultApplicantPage,
  type DocumentResultSort,
  type DocumentResultStatus,
} from '@/features/recruitment/types'
import { getBoardSortOptions, getBoardStatusTabs } from '@/features/recruitment/utils/boardQuery'
import {
  getDocumentResultHref,
  parseDocumentResultQuery,
} from '@/features/recruitment/utils/documentResultQuery'
import { formatDateTimeWithWeekday } from '@/utils/date'
import { DocumentResultEmptyState } from './documentResultEmptyState'
import { DocumentResultSummaryBar } from './documentResultSummaryBar'
import { DocumentResultSkeletonTable, DocumentResultTable } from './documentResultTable'
import type { Route } from 'next'

const TITLE = '서류 평가 취합'

const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_RESULT_SORTS, DOCUMENT_RESULT_SORT_LABEL)

const NOOP = () => undefined

// 확정 후에는 보류가 남지 않아 보류 탭 숨김
function getStatusTabs(
  statusCounts: DocumentResultApplicantPage['statusCounts'] | null,
  isConfirmed: boolean,
) {
  const statuses = isConfirmed
    ? DOCUMENT_RESULT_STATUSES.filter((status) => status !== 'hold')
    : DOCUMENT_RESULT_STATUSES
  return getBoardStatusTabs(statuses, DOCUMENT_RESULT_STATUS_LABEL, statusCounts)
}

function getHeader(confirmedAt: string | null) {
  if (!confirmedAt) {
    return { title: TITLE }
  }

  return {
    title: TITLE,
    badge: (
      <Badge tone="positive" variant="weak">
        확정 완료
      </Badge>
    ),
    description: `${formatDateTimeWithWeekday(new Date(confirmedAt))}에 결과를 확정했어요.`,
  }
}

function DocumentResultContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const { data, query, isError, isPlaceholderData, changeResult, isSaving } = useDocumentResults(
    postingId,
    parseDocumentResultQuery(useSearchParams()),
  )

  if (!data) {
    return <DocumentResultContentFallback isError={isError} />
  }

  const { positionOptions } = data
  const isConfirmed = data.confirmedAt !== null
  const selectedPositionLabels = positionOptions
    .filter((option) => query.positions.includes(option.value))
    .map((option) => option.label)

  // 목록 조건은 URL에만 두고 서버 렌더링 없이 갱신, 포지션을 모두 고르면 전체로 처리
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<DocumentResultStatus, DocumentResultSort, string>,
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
    window.history.replaceState(null, '', getDocumentResultHref(postingId, nextQuery))
  }

  function handlePageNavigate(href: Route) {
    window.history.pushState(null, '', href)
  }

  return (
    <>
      <RecruitmentBoard
        header={getHeader(data.confirmedAt)}
        isHeaderSticky
        query={query}
        statusTabs={getStatusTabs(data.statusCounts, isConfirmed)}
        tabsLabel="최종 결과"
        sortOptions={SORT_OPTIONS}
        positionOptions={positionOptions}
        canFilterPosition={data.hasPositions}
        isPending={isPlaceholderData}
        skeleton={<DocumentResultSkeletonTable hasPositions={data.hasPositions} />}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        getPageHref={(page) => getDocumentResultHref(postingId, { ...query, page })}
        onQueryChange={handleQueryChange}
        onPageNavigate={handlePageNavigate}
      >
        <DocumentResultTable
          isConfirmed={isConfirmed}
          hasPositions={data.hasPositions}
          applicants={data.applicants}
          onResultChange={changeResult}
          emptyState={
            <DocumentResultEmptyState
              status={query.status}
              positionLabels={selectedPositionLabels}
              keyword={query.keyword.trim()}
              totalCount={data.statusCounts.all}
            />
          }
        />
      </RecruitmentBoard>
      <DocumentResultSummaryBar
        postingId={postingId}
        hasInterview={data.hasInterview}
        isConfirmed={isConfirmed}
        totals={data.totals}
        isSaving={isSaving}
        visibleHoldCount={data.statusCounts.hold}
      />
    </>
  )
}

// 첫 진입 로딩·이전 목록 없는 조회 실패용, 탭·필터 조작 차단
function DocumentResultContentFallback({ isError = false }: { isError?: boolean }) {
  return (
    <RecruitmentBoard
      header={getHeader(null)}
      isHeaderSticky
      query={parseDocumentResultQuery({})}
      statusTabs={getStatusTabs(null, false)}
      tabsLabel="최종 결과"
      sortOptions={SORT_OPTIONS}
      positionOptions={[]}
      canFilterPosition={false}
      isPending={false}
      skeleton={null}
      currentPage={1}
      totalPages={0}
      getPageHref={() => '/manage/postings'}
      onQueryChange={NOOP}
      onPageNavigate={NOOP}
      isPlaceholder
    >
      {isError ? (
        <RecruitmentBoardLoadError />
      ) : (
        <div className="animate-skeleton-delayed-show">
          <DocumentResultSkeletonTable />
        </div>
      )}
    </RecruitmentBoard>
  )
}

export { DocumentResultContent, DocumentResultContentFallback }

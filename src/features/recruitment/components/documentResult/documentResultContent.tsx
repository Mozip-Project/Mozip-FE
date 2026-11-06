'use client'

import { useParams, useSearchParams } from 'next/navigation'
import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/components/recruitmentBoard/recruitmentBoard'
import {
  useDocumentResultOverview,
  useDocumentResultsQuery,
  useUpdateDocumentResultMutation,
} from '@/features/recruitment/hooks/useDocumentResults'
import {
  DOCUMENT_RESULT_NO_SCORE_SORT_LABEL,
  DOCUMENT_RESULT_NO_SCORE_SORTS,
  DOCUMENT_RESULT_SORT_LABEL,
  DOCUMENT_RESULT_SORTS,
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULT_STATUSES,
  type DocumentResultApplicantPage,
  type DocumentResultQuery,
  type DocumentResultSort,
  type DocumentResultStatus,
} from '@/features/recruitment/types'
import { getBoardSortOptions, getBoardStatusTabs } from '@/features/recruitment/utils/boardQuery'
import {
  getDocumentResultHref,
  parseDocumentResultQuery,
} from '@/features/recruitment/utils/documentResultQuery'
import { DocumentResultEmptyState } from './documentResultEmptyState'
import { DocumentResultSummaryBar } from './documentResultSummaryBar'
import { DocumentResultSkeletonTable, DocumentResultTable } from './documentResultTable'
import type { Route } from 'next'

const SCORE_SORT_OPTIONS = getBoardSortOptions(DOCUMENT_RESULT_SORTS, DOCUMENT_RESULT_SORT_LABEL)

const NO_SCORE_SORT_OPTIONS = getBoardSortOptions(
  DOCUMENT_RESULT_NO_SCORE_SORTS,
  DOCUMENT_RESULT_NO_SCORE_SORT_LABEL,
)

const NOOP = () => undefined

function getStatusTabs(statusCounts: DocumentResultApplicantPage['statusCounts'] | null) {
  return getBoardStatusTabs(DOCUMENT_RESULT_STATUSES, DOCUMENT_RESULT_STATUS_LABEL, statusCounts)
}

// TODO: 조회 실패 상태는 디자인 확정 후 추가
function DocumentResultContent() {
  const { recruitmentId } = useParams<{ recruitmentId: string }>()
  const query = parseDocumentResultQuery(useSearchParams())
  const { data, isPlaceholderData } = useDocumentResultsQuery(recruitmentId, query)
  const overview = useDocumentResultOverview(recruitmentId)
  const { mutate: updateResult } = useUpdateDocumentResultMutation(recruitmentId, query)

  if (!data || !overview) {
    return <DocumentResultContentFallback />
  }

  // 목록 조건은 URL에만 두고 서버 렌더링 없이 갱신
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<DocumentResultStatus, DocumentResultSort>,
  ) {
    const nextQuery: DocumentResultQuery = { ...query, ...change, page: 1 }
    window.history.replaceState(null, '', getDocumentResultHref(recruitmentId, nextQuery))
  }

  function handlePageNavigate(href: Route) {
    window.history.pushState(null, '', href)
  }

  return (
    <>
      <RecruitmentBoard
        query={query}
        statusTabs={getStatusTabs(data.statusCounts)}
        tabsLabel="최종 결과"
        sortOptions={data.hasScore ? SCORE_SORT_OPTIONS : NO_SCORE_SORT_OPTIONS}
        positionCounts={data.positionCounts}
        isPending={isPlaceholderData}
        skeleton={<DocumentResultSkeletonTable hasScore={data.hasScore} />}
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        getPageHref={(page) => getDocumentResultHref(recruitmentId, { ...query, page })}
        onQueryChange={handleQueryChange}
        onPageNavigate={handlePageNavigate}
      >
        <DocumentResultTable
          hasScore={data.hasScore}
          isConfirmed={overview.confirmedAt !== null}
          applicants={data.applicants}
          onResultChange={(applicantId, result) => updateResult({ applicantId, result })}
          emptyState={
            <DocumentResultEmptyState
              query={query}
              keyword={query.keyword.trim()}
              totalCount={data.statusCounts.all}
            />
          }
        />
      </RecruitmentBoard>
      <DocumentResultSummaryBar
        recruitmentId={recruitmentId}
        statusCounts={data.statusCounts}
        totalResultCounts={data.totalResultCounts}
        overview={overview}
      />
    </>
  )
}

// 첫 진입 로딩용, 점수 사용 여부를 받기 전이라 점수 있는 공고 기준으로 표시하고 조작 차단
function DocumentResultContentFallback() {
  return (
    <div inert>
      <RecruitmentBoard
        query={parseDocumentResultQuery({})}
        statusTabs={getStatusTabs(null)}
        tabsLabel="최종 결과"
        sortOptions={SCORE_SORT_OPTIONS}
        positionCounts={null}
        isPending={false}
        skeleton={null}
        currentPage={1}
        totalPages={0}
        getPageHref={() => '/manage/recruitments'}
        onQueryChange={NOOP}
        onPageNavigate={NOOP}
      >
        <div className="animate-skeleton-delayed-show">
          <DocumentResultSkeletonTable hasScore />
        </div>
      </RecruitmentBoard>
    </div>
  )
}

export { DocumentResultContent, DocumentResultContentFallback }

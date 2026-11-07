'use client'

import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition, type ReactNode } from 'react'
import {
  RecruitmentBoard,
  type RecruitmentBoardQueryChange,
} from '@/features/recruitment/components/recruitmentBoard/recruitmentBoard'
import {
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewPosition,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
} from '@/features/recruitment/types'
import { getBoardSortOptions, getBoardStatusTabs } from '@/features/recruitment/utils/boardQuery'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import { DocumentReviewSkeletonTable } from './documentReviewSkeletonTable'
import type { Route } from 'next'

const SORT_OPTIONS = getBoardSortOptions(DOCUMENT_REVIEW_SORTS, DOCUMENT_REVIEW_SORT_LABEL)

type DocumentReviewBoardProps = {
  recruitmentId: string
  query: DocumentReviewQuery
  // null은 첫 진입 로딩 중
  statusCounts: Record<DocumentReviewStatus, number> | null
  positionCounts: Record<DocumentReviewPosition, number> | null
  currentPage: number
  totalPages: number
  children: ReactNode
}

function DocumentReviewBoard({
  recruitmentId,
  query,
  statusCounts,
  positionCounts,
  currentPage,
  totalPages,
  children,
}: DocumentReviewBoardProps) {
  const router = useRouter()
  // 서버 응답 전에도 선택한 탭·필터를 바로 표시
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query)
  const [isPending, startTransition] = useTransition()

  // 조건 변경과 같은 전환으로 로딩 상태 공유, 이동 기록은 남김
  function handlePageNavigate(href: Route) {
    startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  // 조건이 바뀌면 결과 개수가 달라지므로 첫 페이지로 이동
  function handleQueryChange(
    change: RecruitmentBoardQueryChange<DocumentReviewStatus, DocumentReviewSort>,
  ) {
    const nextQuery = { ...optimisticQuery, ...change, page: 1 }

    startTransition(() => {
      setOptimisticQuery(nextQuery)
      router.replace(getDocumentReviewHref(recruitmentId, nextQuery), { scroll: false })
    })
  }

  return (
    <RecruitmentBoard
      query={optimisticQuery}
      statusTabs={getBoardStatusTabs(
        DOCUMENT_REVIEW_STATUSES,
        DOCUMENT_REVIEW_STATUS_LABEL,
        statusCounts,
      )}
      tabsLabel="평가 상태"
      sortOptions={SORT_OPTIONS}
      positionCounts={positionCounts}
      isPending={isPending}
      skeleton={<DocumentReviewSkeletonTable />}
      currentPage={currentPage}
      totalPages={totalPages}
      getPageHref={(page) => getDocumentReviewHref(recruitmentId, { ...query, page })}
      onQueryChange={handleQueryChange}
      onPageNavigate={handlePageNavigate}
    >
      {children}
    </RecruitmentBoard>
  )
}

// 첫 진입 로딩용, URL을 읽기 전 정적 셸이라 기본 조건으로 표시하고 조작 차단
function DocumentReviewBoardPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div inert>
      <DocumentReviewBoard
        recruitmentId=""
        query={parseDocumentReviewQuery({})}
        statusCounts={null}
        positionCounts={null}
        currentPage={1}
        totalPages={0}
      >
        {children}
      </DocumentReviewBoard>
    </div>
  )
}

export { DocumentReviewBoard, DocumentReviewBoardPlaceholder }

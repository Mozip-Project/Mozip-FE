import { getDocumentReviewApplicants } from '@/features/recruitment/api/organizer'
import { DOCUMENT_REVIEW_POSITIONS } from '@/features/recruitment/types'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import { DocumentReviewApplicantTable } from './documentReviewApplicantTable'
import { DocumentReviewBoard, DocumentReviewBoardPlaceholder } from './documentReviewBoard'
import { DocumentReviewEmptyState } from './documentReviewEmptyState'
import { DocumentReviewSkeletonTable } from './documentReviewSkeletonTable'
import type { Route } from 'next'

type DocumentReviewContentProps = Pick<
  PageProps<'/manage/recruitments/[recruitmentId]/documents'>,
  'params' | 'searchParams'
>

async function DocumentReviewContent({ params, searchParams }: DocumentReviewContentProps) {
  const { recruitmentId } = await params
  const query = parseDocumentReviewQuery(await searchParams)
  const { applicants, statusCounts, positionCounts, currentPage, totalPages } =
    await getDocumentReviewApplicants(recruitmentId, query)
  const isPositionFiltered = query.positions.length < DOCUMENT_REVIEW_POSITIONS.length
  // 포지션만 전체로, 탭·정렬·검색어는 유지
  const resetFilterHref = isPositionFiltered
    ? getDocumentReviewHref(recruitmentId, {
        ...query,
        positions: DOCUMENT_REVIEW_POSITIONS,
        page: 1,
      })
    : undefined
  const startReviewHref = await getStartReviewHref()

  // 평가 완료 탭이 비었을 때만 같은 조건·정렬의 평가 전 목록에서 첫 지원자 조회
  async function getStartReviewHref() {
    if (query.status !== 'done' || applicants.length > 0 || statusCounts.all === 0) {
      return undefined
    }

    const { applicants: pendingApplicants } = await getDocumentReviewApplicants(recruitmentId, {
      ...query,
      status: 'pending',
      page: 1,
    })
    const firstApplicant = pendingApplicants.at(0)

    if (!firstApplicant) {
      return undefined
    }

    // typedRoutes는 리터럴만 검사, Next 문서 안내대로 Route 단언
    return `/manage/recruitments/${recruitmentId}/documents/${firstApplicant.id}` as Route
  }

  return (
    <DocumentReviewBoard
      recruitmentId={recruitmentId}
      query={query}
      statusCounts={statusCounts}
      positionCounts={positionCounts}
      currentPage={currentPage}
      totalPages={totalPages}
    >
      <DocumentReviewApplicantTable
        recruitmentId={recruitmentId}
        applicants={applicants}
        emptyState={
          <DocumentReviewEmptyState
            recruitmentId={recruitmentId}
            status={query.status}
            totalCount={statusCounts.all}
            keyword={query.keyword.trim()}
            resetFilterHref={resetFilterHref}
            startReviewHref={startReviewHref}
          />
        }
      />
    </DocumentReviewBoard>
  )
}

function DocumentReviewContentFallback() {
  return (
    <DocumentReviewBoardPlaceholder>
      <div className="animate-skeleton-delayed-show">
        <DocumentReviewSkeletonTable />
      </div>
    </DocumentReviewBoardPlaceholder>
  )
}

export { DocumentReviewContent, DocumentReviewContentFallback }

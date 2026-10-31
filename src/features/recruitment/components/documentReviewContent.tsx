import {
  DOCUMENT_REVIEW_POSITIONS,
  getDocumentReviewApplicants,
} from '@/features/recruitment/api/organizer'
import { DocumentReviewApplicantTable } from './documentReviewApplicantTable'
import { DocumentReviewBoard, DocumentReviewBoardPlaceholder } from './documentReviewBoard'
import { getDocumentReviewHref, parseDocumentReviewQuery } from './documentReviewQuery'
import { DocumentReviewSkeletonTable } from './documentReviewSkeletonTable'

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
        status={query.status}
        totalCount={statusCounts.all}
        keyword={query.keyword.trim()}
        resetFilterHref={resetFilterHref}
      />
    </DocumentReviewBoard>
  )
}

function DocumentReviewContentFallback() {
  return (
    <DocumentReviewBoardPlaceholder>
      <DocumentReviewSkeletonTable />
    </DocumentReviewBoardPlaceholder>
  )
}

export { DocumentReviewContent, DocumentReviewContentFallback }

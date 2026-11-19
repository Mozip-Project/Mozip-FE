import { getDocumentReviewApplicants } from '@/features/recruitment/api/organizer'
import { hasPositionFilter } from '@/features/recruitment/utils/boardQuery'
import { parseDocumentReviewQuery } from '@/features/recruitment/utils/documentReviewQuery'
import { getApplicantReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { DocumentReviewApplicantTable } from './documentReviewApplicantTable'
import { DocumentReviewBoard, DocumentReviewBoardPlaceholder } from './documentReviewBoard'
import { DocumentReviewEmptyState } from './documentReviewEmptyState'
import { DocumentReviewSkeletonTable } from './documentReviewSkeletonTable'

type DocumentReviewContentProps = Pick<
  PageProps<'/manage/postings/[postingId]/documents'>,
  'params' | 'searchParams'
>

async function DocumentReviewContent({ params, searchParams }: DocumentReviewContentProps) {
  const { postingId } = await params
  const query = parseDocumentReviewQuery(await searchParams)
  const { applicants, statusCounts, positionCounts, currentPage, totalPages } =
    await getDocumentReviewApplicants(postingId, query)
  const startReviewHref = await getStartReviewHref()

  // 평가 완료 탭이 비었을 때만 같은 조건·정렬의 평가 전 목록에서 첫 지원자 조회
  async function getStartReviewHref() {
    if (query.status !== 'done' || applicants.length > 0 || statusCounts.all === 0) {
      return undefined
    }

    const { applicants: pendingApplicants } = await getDocumentReviewApplicants(postingId, {
      ...query,
      status: 'pending',
      page: 1,
    })
    const firstApplicant = pendingApplicants.at(0)

    if (!firstApplicant) {
      return undefined
    }

    return getApplicantReviewPath(postingId, firstApplicant.id)
  }

  return (
    <DocumentReviewBoard
      postingId={postingId}
      query={query}
      statusCounts={statusCounts}
      positionCounts={positionCounts}
      currentPage={currentPage}
      totalPages={totalPages}
    >
      <DocumentReviewApplicantTable
        postingId={postingId}
        applicants={applicants}
        emptyState={
          <DocumentReviewEmptyState
            postingId={postingId}
            status={query.status}
            totalCount={statusCounts.all}
            keyword={query.keyword.trim()}
            isPositionFiltered={hasPositionFilter(query.positions)}
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

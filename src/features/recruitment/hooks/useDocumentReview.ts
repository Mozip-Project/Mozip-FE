import {
  useDocEvaluationApplicationsQuery,
  useRecruitmentPostingQuery,
} from '@/features/recruitment/api/organizer/queries'
import type {
  DocumentReviewAction,
  DocumentReviewApplicantPage,
  DocumentReviewQuery,
  DocumentReviewStatus,
} from '@/features/recruitment/types'
import { APPLICATION_SORT } from '@/features/recruitment/utils/boardQuery'
import { getApplicantReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'
import type {
  DocEvaluationApplicationsQuery,
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationTab,
  MyDocEvaluationStatus,
} from '@/gql/graphql'

type DocEvaluationApplicationPage = DocEvaluationApplicationsQuery['docEvaluationApplications']

const DOC_EVALUATION_TAB = {
  all: 'ALL',
  pending: 'NOT_EVALUATED',
  done: 'EVALUATED',
} satisfies Record<DocumentReviewStatus, DocEvaluationTab>

// 빈 검색어는 생략해 전체 조회
function toDocEvaluationApplicationsVariables(
  postingId: string,
  query: DocumentReviewQuery,
): DocEvaluationApplicationsQueryVariables {
  const keyword = query.keyword.trim()

  return {
    postingId,
    tab: DOC_EVALUATION_TAB[query.status],
    positionIds: query.positions.length > 0 ? [...query.positions] : null,
    keyword: keyword === '' ? null : keyword,
    sort: APPLICATION_SORT[query.sort],
    page: query.page,
  }
}

function getDocumentReviewAction(
  status: MyDocEvaluationStatus,
  isResultConfirmed: boolean,
): DocumentReviewAction {
  if (isResultConfirmed) {
    return 'view'
  }

  switch (status) {
    case 'NONE':
    case 'DRAFT':
      return 'evaluate'
    case 'SAVED':
      return 'edit'
  }
}

function toApplicants({ rows }: DocEvaluationApplicationPage, isResultConfirmed: boolean) {
  return rows.map(({ application, myEvaluationStatus }) => ({
    id: application.id,
    name: application.user.name,
    positionName: application.position?.name ?? null,
    submittedAt: application.submittedAt ?? null,
    action: getDocumentReviewAction(myEvaluationStatus, isResultConfirmed),
  }))
}

function toPositionOptions({ positionCounts }: DocEvaluationApplicationPage) {
  return positionCounts.map(({ position, count }) => ({
    value: position.id,
    label: position.name,
    count,
  }))
}

function useDocumentReview(postingId: string, query: DocumentReviewQuery) {
  const variables = toDocEvaluationApplicationsVariables(postingId, query)
  const postingQuery = useRecruitmentPostingQuery(postingId)
  const applicationsQuery = useDocEvaluationApplicationsQuery(variables, {
    shouldKeepPreviousData: true,
  })
  const posting = postingQuery.data
  const applications = applicationsQuery.data

  // 평가 완료 탭이 비었을 때만 같은 조건, 정렬의 평가 전 첫 지원자 조회
  const isDoneTabEmpty =
    !applicationsQuery.isPlaceholderData &&
    query.status === 'done' &&
    applications?.rows.length === 0 &&
    applications.tabCounts.all > 0
  const firstPendingQuery = useDocEvaluationApplicationsQuery(
    { ...variables, tab: 'NOT_EVALUATED', page: 1 },
    { enabled: isDoneTabEmpty },
  )
  const firstPendingApplication = firstPendingQuery.data?.rows.at(0)?.application

  const data: DocumentReviewApplicantPage | undefined =
    posting && applications
      ? {
          applicants: toApplicants(applications, posting.docResultConfirmedAt !== null),
          statusCounts: {
            all: applications.tabCounts.all,
            pending: applications.tabCounts.notEvaluated,
            done: applications.tabCounts.evaluated,
          },
          positionOptions: toPositionOptions(applications),
          currentPage: applications.page,
          totalPages: applications.totalPages,
          hasPositions: !posting.noPosition,
        }
      : undefined

  // 이전 목록이 남아 있지 않은 조회 실패만 실패 화면으로 표시
  const isError = !data && (postingQuery.isError || applicationsQuery.isError)

  return {
    data,
    // 목록 조회 전·실패에도 통합 모집이면 포지션 필터를 숨기도록 공고 정보로 판단
    hasPositions: posting ? !posting.noPosition : false,
    isError,
    isPlaceholderData: applicationsQuery.isPlaceholderData,
    startReviewHref:
      isDoneTabEmpty && firstPendingApplication
        ? getApplicantReviewPath(postingId, firstPendingApplication.id)
        : undefined,
  }
}

export { useDocumentReview }

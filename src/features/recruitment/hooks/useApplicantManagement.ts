import {
  useApplicantManagementPostingQuery,
  usePostingApplicationsQuery,
} from '@/features/recruitment/api/organizer/queries'
import {
  APPLICANT_ALL_POSITIONS_TAB,
  type ApplicantManagementPage,
  type ApplicantManagementQuery,
} from '@/features/recruitment/types'
import { toPostingApplicationsVariables } from '@/features/recruitment/utils/applicantManagementQuery'
import { getDocumentResultPhase } from '@/features/recruitment/utils/applicantResult'
import type { PostingApplicationsQuery } from '@/gql/graphql'

type PostingApplicationPage = PostingApplicationsQuery['postingApplications']

// 포지션 없는 모집은 positionCounts가 비어 전체 탭만 표시
function toPositionTabs({ totalCount, positionCounts }: PostingApplicationPage) {
  return [
    { value: APPLICANT_ALL_POSITIONS_TAB, label: '전체', count: totalCount },
    ...positionCounts.map(({ position, count }) => ({
      value: position.id,
      label: position.name,
      count,
    })),
  ]
}

function toApplicants({ rows }: PostingApplicationPage) {
  return rows.map(({ id, user, position, docResult, finalResult }) => ({
    id,
    name: user.name,
    positionName: position?.name ?? null,
    documentResult: docResult,
    finalResult,
  }))
}

// 공고 정보는 조건과 무관해 한 번만 조회, 목록은 조건 변경 중 이전 결과 유지
function useApplicantManagement(postingId: string, query: ApplicantManagementQuery) {
  const postingQuery = useApplicantManagementPostingQuery(postingId)
  const applicationsQuery = usePostingApplicationsQuery(
    toPostingApplicationsVariables(postingId, query),
  )
  const posting = postingQuery.data
  const applications = applicationsQuery.data

  const data: ApplicantManagementPage | undefined =
    posting && applications
      ? {
          applicants: toApplicants(applications),
          positionTabs: toPositionTabs(applications),
          currentPage: applications.page,
          totalPages: applications.totalPages,
          hasInterview: posting.hasInterview,
          hasPositions: !posting.noPosition,
          resultPhase: getDocumentResultPhase(posting.status, posting.docResultConfirmedAt),
        }
      : undefined

  // 이전 목록이 남아 있지 않은 조회 실패만 실패 화면으로 표시
  const isError = !data && (postingQuery.isError || applicationsQuery.isError)

  return { data, isError, isPlaceholderData: applicationsQuery.isPlaceholderData }
}

export { useApplicantManagement }

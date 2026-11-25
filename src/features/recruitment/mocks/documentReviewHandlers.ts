import { delay, HttpResponse } from 'msw'
import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import { findOrganizationPostingSample } from '@/features/posting/mocks/organizationPostingSamples'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import { DOCUMENT_REVIEW_PAGE_SIZE } from '@/features/recruitment/types'
import type {
  ApplicationSort,
  DocEvaluationApplicationsQuery,
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationTab,
  MyDocEvaluationStatus,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { DOCUMENT_REVIEW_SAMPLE } from './documentReviewSample'

type SampleApplicant = (typeof DOCUMENT_REVIEW_SAMPLE)[number]

// 상세 평가 샘플에서 일부 입력한 3번 지원자는 임시저장 상태
function getMyEvaluationStatus(applicant: SampleApplicant): MyDocEvaluationStatus {
  if (applicant.isEvaluated) {
    return 'SAVED'
  }
  return applicant.id === '3' ? 'DRAFT' : 'NONE'
}

function matchesTab(applicant: SampleApplicant, tab: DocEvaluationTab) {
  const isSaved = getMyEvaluationStatus(applicant) === 'SAVED'
  switch (tab) {
    case 'ALL':
      return true
    case 'NOT_EVALUATED':
      return !isSaved
    case 'EVALUATED':
      return isSaved
  }
}

function compareApplicants(a: SampleApplicant, b: SampleApplicant, sort: ApplicationSort) {
  switch (sort) {
    case 'SUBMITTED_DESC':
      return b.submittedAt.localeCompare(a.submittedAt)
    case 'SUBMITTED_ASC':
      return a.submittedAt.localeCompare(b.submittedAt)
    case 'NAME_ASC':
      return a.name.localeCompare(b.name, 'ko')
    case 'NAME_DESC':
      return b.name.localeCompare(a.name, 'ko')
  }
}

function errorBody(code: string, message: string) {
  return { errors: [{ message, extensions: { code } }], data: null }
}

const POSTING_NOT_FOUND_ERROR = ['POSTING_404', '공고를 찾을 수 없습니다.'] as const

const documentReviewHandlers = [
  graphqlApi.query<DocEvaluationApplicationsQuery, DocEvaluationApplicationsQueryVariables>(
    'DocEvaluationApplications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const sample = getManagedPostingSample(postingId) && findOrganizationPostingSample(postingId)

      if (!sample) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const { positionIds, keyword, tab, sort, page } = variables
      // GraphQL의 리스트 입력은 단일 ID로도 전달할 수 있음
      const selectedPositionIds =
        positionIds == null
          ? []
          : (Array.isArray(positionIds) ? positionIds : [positionIds]).map(String)
      if (page !== null && page !== undefined && page < 1) {
        return HttpResponse.json(errorBody('COMMON_400', 'page는 1 이상이어야 합니다.'))
      }

      // 포지션 숫자는 검색어만, 탭 숫자는 검색어·포지션 필터만 적용
      const searched = DOCUMENT_REVIEW_SAMPLE.slice(0, sample.applicantCount).filter(({ name }) =>
        name.includes(keyword ?? ''),
      )
      const selected = searched.filter(
        ({ position }) =>
          selectedPositionIds.length === 0 ||
          (!sample.noPosition && selectedPositionIds.includes(position)),
      )
      const list = selected
        .filter((applicant) => matchesTab(applicant, tab ?? 'ALL'))
        .sort((a, b) => compareApplicants(a, b, sort ?? 'SUBMITTED_DESC'))
      const totalPages = Math.ceil(list.length / DOCUMENT_REVIEW_PAGE_SIZE)
      // 지원자 관리 MSW와 동일하게 범위 밖 페이지는 마지막 페이지로 맞춤
      const currentPage = Math.min(Math.max(page ?? 1, 1), Math.max(totalPages, 1))
      const pageStart = (currentPage - 1) * DOCUMENT_REVIEW_PAGE_SIZE
      const evaluated = selected.filter((applicant) => matchesTab(applicant, 'EVALUATED')).length

      return HttpResponse.json({
        data: {
          docEvaluationApplications: {
            rows: list.slice(pageStart, pageStart + DOCUMENT_REVIEW_PAGE_SIZE).map((applicant) => ({
              application: {
                // 상세 평가가 샘플인 동안 같은 지원자로 이동하도록 기존 ID 유지
                id: applicant.id,
                user: { name: applicant.name },
                position: sample.noPosition
                  ? null
                  : {
                      name: UXUX_POSITIONS.find(({ id }) => id === applicant.position)?.name ?? '',
                    },
                submittedAt: `${applicant.submittedAt}:00+09:00`,
              },
              myEvaluationStatus: getMyEvaluationStatus(applicant),
            })),
            totalCount: list.length,
            tabCounts: {
              all: selected.length,
              notEvaluated: selected.length - evaluated,
              evaluated,
            },
            positionCounts: sample.noPosition
              ? []
              : UXUX_POSITIONS.map((position) => ({
                  position: { id: position.id, name: position.name },
                  count: searched.filter((applicant) => applicant.position === position.id).length,
                })),
            page: currentPage,
            totalPages,
          },
        },
      })
    },
  ),
]

export { documentReviewHandlers }

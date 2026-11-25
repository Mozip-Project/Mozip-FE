import { delay, HttpResponse } from 'msw'
import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import {
  findOrganizationPostingSample,
  type OrganizationPostingSample,
} from '@/features/posting/mocks/organizationPostingSamples'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import { DOCUMENT_RESULT_SAMPLE } from '@/features/recruitment/mocks/documentResultSample'
import { APPLICANT_MANAGEMENT_PAGE_SIZE } from '@/features/recruitment/types'
import type {
  ApplicantManagementPostingQuery,
  ApplicantManagementPostingQueryVariables,
  ApplicationSort,
  DocResult,
  FinalResult,
  PostingApplicationsQuery,
  PostingApplicationsQueryVariables,
  PostingStatus,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

const SAMPLE_FIRST_SUBMITTED_AT = Date.UTC(2026, 9, 15, 12)
const SAMPLE_SUBMIT_INTERVAL_MS = 60 * 60 * 1000

// 면접 결과 확정 공고에서 서류 합격자 3명 중 1명은 면접 불합격
const INTERVIEW_FAIL_EVERY = 3

type SampleApplication = {
  id: string
  name: string
  position: { id: string; name: string } | null
  docResult: DocResult
  finalResult: FinalResult
  submittedAt: string
}

type ApplicationCase = {
  applications: SampleApplication[]
  // 포지션 없는 모집은 탭 숫자 없음
  hasPositions: boolean
}

type SampleResult = (typeof DOCUMENT_RESULT_SAMPLE)[number]['result']

const DOC_RESULT = { pass: 'PASS', hold: 'HOLD', fail: 'FAIL' } as const satisfies Record<
  SampleResult,
  DocResult
>

// 확정 전에는 평가 중 의견, 확정 후에는 보류 없이 합격·불합격, 면접 결과는 전체 완료 공고만
function getResults(
  status: PostingStatus,
  result: SampleResult,
  index: number,
): Pick<SampleApplication, 'docResult' | 'finalResult'> {
  const confirmedDocResult = result === 'pass' ? 'PASS' : 'FAIL'

  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
      return { docResult: 'PENDING', finalResult: 'PENDING' }
    case 'DOC_REVIEW':
      return { docResult: DOC_RESULT[result], finalResult: 'PENDING' }
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'ENDED':
      return { docResult: confirmedDocResult, finalResult: 'PENDING' }
    case 'FINAL_RESULT': {
      const isInterviewFail = confirmedDocResult === 'FAIL' || index % INTERVIEW_FAIL_EVERY === 0
      return { docResult: confirmedDocResult, finalResult: isInterviewFail ? 'FAIL' : 'PASS' }
    }
  }
}

// 지원자 수·파트 유무는 단체 공고 샘플 기준, 이름은 서류 평가 취합 샘플의 가상 인물
// 목록 순서대로 1시간씩 앞선 제출 시각
function getApplicationCase({
  status,
  noPosition,
  applicantCount,
}: OrganizationPostingSample): ApplicationCase {
  const hasPositions = !noPosition
  const applications = DOCUMENT_RESULT_SAMPLE.slice(0, applicantCount).map(
    ({ id, name, position, result }, index) => ({
      id: `application-${id}`,
      name,
      position: hasPositions ? (UXUX_POSITIONS.find((item) => item.id === position) ?? null) : null,
      ...getResults(status, result, index),
      submittedAt: new Date(
        SAMPLE_FIRST_SUBMITTED_AT - index * SAMPLE_SUBMIT_INTERVAL_MS,
      ).toISOString(),
    }),
  )

  return { applications, hasPositions }
}

function compareApplications(a: SampleApplication, b: SampleApplication, sort: ApplicationSort) {
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

const applicantManagementHandlers = [
  graphqlApi.query<ApplicantManagementPostingQuery, ApplicantManagementPostingQueryVariables>(
    'ApplicantManagementPosting',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      const posting = getManagedPostingSample(postingId)
      const sample = findOrganizationPostingSample(postingId)

      if (!posting || !sample) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      const { id, status, hasInterview, docResultConfirmedAt } = posting
      return HttpResponse.json({
        data: {
          posting: {
            id,
            status,
            hasInterview,
            noPosition: sample.noPosition,
            docResultConfirmedAt,
          },
        },
      })
    },
  ),

  graphqlApi.query<PostingApplicationsQuery, PostingApplicationsQueryVariables>(
    'PostingApplications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { positionId, keyword, sort = 'SUBMITTED_DESC', page = 1 } = variables
      // 삭제된 작성 중 공고는 운영진 홈 상태에 없어 공고 없음
      const postingId = String(variables.postingId)
      const sample = getManagedPostingSample(postingId) && findOrganizationPostingSample(postingId)
      const found = sample && getApplicationCase(sample)

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }
      if (page !== null && page < 1) {
        return HttpResponse.json(errorBody('COMMON_400', 'page는 1 이상이어야 합니다.'))
      }

      // 탭 숫자는 검색어만 적용하고 포지션 탭은 무시
      const searched = found.applications.filter(({ name }) => name.includes(keyword ?? ''))
      const list = searched
        .filter(({ position }) => !positionId || position?.id === String(positionId))
        .sort((a, b) => compareApplications(a, b, sort ?? 'SUBMITTED_DESC'))
      const totalPages = Math.ceil(list.length / APPLICANT_MANAGEMENT_PAGE_SIZE)
      // TODO: 마지막 페이지를 넘긴 요청의 서버 동작 확인, 지금은 마지막 페이지로 맞춤
      const currentPage = Math.min(Math.max(page ?? 1, 1), Math.max(totalPages, 1))
      const pageStart = (currentPage - 1) * APPLICANT_MANAGEMENT_PAGE_SIZE

      return HttpResponse.json({
        data: {
          postingApplications: {
            rows: list
              .slice(pageStart, pageStart + APPLICANT_MANAGEMENT_PAGE_SIZE)
              .map(({ id, name, position, docResult, finalResult }) => ({
                id,
                user: { name },
                position: position && { name: position.name },
                docResult,
                finalResult,
              })),
            totalCount: searched.length,
            positionCounts: found.hasPositions
              ? UXUX_POSITIONS.map((position) => ({
                  position,
                  count: searched.filter((item) => item.position?.id === position.id).length,
                }))
              : [],
            page: currentPage,
            totalPages,
          },
        },
      })
    },
  ),
]

export { applicantManagementHandlers }

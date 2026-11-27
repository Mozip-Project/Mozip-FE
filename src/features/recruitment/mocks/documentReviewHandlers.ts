import { delay, HttpResponse } from 'msw'
import { MOZIP_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
import { DOCUMENT_REVIEW_PAGE_SIZE } from '@/features/recruitment/types'
import type {
  ApplicationSort,
  DocEvaluationApplicationChipsQuery,
  DocEvaluationApplicationChipsQueryVariables,
  DocEvaluationApplicationDetailQuery,
  DocEvaluationApplicationDetailQueryVariables,
  DocEvaluationApplicationsQuery,
  DocEvaluationApplicationsQueryVariables,
  DocEvaluationTab,
  MyDocEvaluationFieldsFragment,
  MyDocEvaluationQuery,
  MyDocEvaluationQueryVariables,
  MyDocEvaluationStatus,
  PostingQuestionsQuery,
  PostingQuestionsQueryVariables,
  SaveDocEvaluationMutation,
  SaveDocEvaluationMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import {
  getApplicationDetailSample,
  getSampleAnswers,
  SAMPLE_POSTING_QUESTIONS,
} from './documentEvaluationSample'
import {
  findApplication,
  getMyEvaluation,
  getMyEvaluationStatus,
  getPostingApplications,
  saveMyEvaluation,
  type PostingApplication,
} from './organizerApplicationStore'

// 학교 인증 전이라 제출 시점 프로필에 학교가 없는 지원자(샘플 번호)
const UNVERIFIED_SCHOOL_SAMPLE_ID = '2'

function matchesTab(status: MyDocEvaluationStatus, tab: DocEvaluationTab) {
  const isSaved = status === 'SAVED'
  switch (tab) {
    case 'ALL':
      return true
    case 'NOT_EVALUATED':
      return !isSaved
    case 'EVALUATED':
      return isSaved
  }
}

function compareApplicants(a: PostingApplication, b: PostingApplication, sort: ApplicationSort) {
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
const APPLICATION_NOT_FOUND_ERROR = ['APPLICATION_404', '지원서를 찾을 수 없습니다.'] as const
const EVALUATION_NOT_FOUND_ERROR = ['EVALUATION_404', '지원서를 찾을 수 없습니다.'] as const
const RESULT_CONFIRMED_ERROR = ['EVALUATION_423', '이미 결과를 확정했습니다.'] as const

const documentReviewHandlers = [
  graphqlApi.query<DocEvaluationApplicationsQuery, DocEvaluationApplicationsQueryVariables>(
    'DocEvaluationApplications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const found = getPostingApplications(String(variables.postingId))

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const { posting, sample, applications } = found
      const { positionIds, keyword, tab, sort, page } = variables
      // GraphQL의 리스트 입력은 단일 ID로도 전달할 수 있음
      const selectedPositionIds =
        positionIds == null
          ? []
          : (Array.isArray(positionIds) ? positionIds : [positionIds]).map(String)
      if (page !== null && page !== undefined && page < 1) {
        return HttpResponse.json(errorBody('COMMON_400', 'page는 1 이상이어야 합니다.'))
      }

      const withStatus = applications.map((application) => ({
        ...application,
        myEvaluationStatus: getMyEvaluationStatus(application, posting.status),
      }))
      // 포지션 숫자는 검색어만, 탭 숫자는 검색어·포지션 필터만 적용
      const searched = withStatus.filter(({ name }) => name.includes(keyword ?? ''))
      const selected = searched.filter(
        ({ positionId }) =>
          selectedPositionIds.length === 0 ||
          (!sample.noPosition && selectedPositionIds.includes(positionId)),
      )
      const list = selected
        .filter(({ myEvaluationStatus }) => matchesTab(myEvaluationStatus, tab ?? 'ALL'))
        .sort((a, b) => compareApplicants(a, b, sort ?? 'SUBMITTED_DESC'))
      const totalPages = Math.ceil(list.length / DOCUMENT_REVIEW_PAGE_SIZE)
      // 지원자 관리 MSW와 동일하게 범위 밖 페이지는 마지막 페이지로 맞춤
      const currentPage = Math.min(Math.max(page ?? 1, 1), Math.max(totalPages, 1))
      const pageStart = (currentPage - 1) * DOCUMENT_REVIEW_PAGE_SIZE
      const evaluated = selected.filter(({ myEvaluationStatus }) =>
        matchesTab(myEvaluationStatus, 'EVALUATED'),
      ).length

      return HttpResponse.json({
        data: {
          docEvaluationApplications: {
            rows: list
              .slice(pageStart, pageStart + DOCUMENT_REVIEW_PAGE_SIZE)
              .map((application) => ({
                application: {
                  id: application.id,
                  user: { name: application.name },
                  position: sample.noPosition
                    ? null
                    : {
                        name:
                          MOZIP_POSITIONS.find(({ id }) => id === application.positionId)?.name ??
                          '',
                      },
                  submittedAt: application.submittedAt,
                },
                myEvaluationStatus: application.myEvaluationStatus,
              })),
            totalCount: list.length,
            tabCounts: {
              all: selected.length,
              notEvaluated: selected.length - evaluated,
              evaluated,
            },
            positionCounts: sample.noPosition
              ? []
              : MOZIP_POSITIONS.map((position) => ({
                  position: { id: position.id, name: position.name },
                  count: searched.filter(({ positionId }) => positionId === position.id).length,
                })),
            page: currentPage,
            totalPages,
          },
        },
      })
    },
  ),
  // 목록과 같은 지원자·평가 상태, 화면은 조건 없이 조회해 전체·제출 최신순
  graphqlApi.query<DocEvaluationApplicationChipsQuery, DocEvaluationApplicationChipsQueryVariables>(
    'DocEvaluationApplicationChips',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const found = getPostingApplications(String(variables.postingId))

      if (!found) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      const chips = [...found.applications]
        .sort((a, b) => compareApplicants(a, b, 'SUBMITTED_DESC'))
        .map((application) => ({
          application: { id: application.id, user: { name: application.name } },
          myEvaluationStatus: getMyEvaluationStatus(application, found.posting.status),
        }))

      return HttpResponse.json({ data: { docEvaluationApplicationChips: chips } })
    },
  ),
  graphqlApi.query<
    DocEvaluationApplicationDetailQuery,
    DocEvaluationApplicationDetailQueryVariables
  >('DocEvaluationApplicationDetail', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    const found = findApplication(String(variables.id))

    if (!found) {
      return HttpResponse.json(errorBody(...APPLICATION_NOT_FOUND_ERROR))
    }

    const { application, sample } = found
    const detail = getApplicationDetailSample(application.sampleId)
    const position = sample.noPosition
      ? undefined
      : MOZIP_POSITIONS.find(({ id }) => id === application.positionId)

    return HttpResponse.json({
      data: {
        application: {
          id: application.id,
          user: { name: application.name },
          position: position ? { id: position.id, name: position.name } : null,
          profileSnapshot: {
            name: application.name,
            phone: '01000000000',
            school: application.sampleId === UNVERIFIED_SCHOOL_SAMPLE_ID ? null : '성균관대학교',
          },
          availableTimes: detail.availableTimes,
          answers: getSampleAnswers(application.sampleId),
        },
      },
    })
  }),
  graphqlApi.query<PostingQuestionsQuery, PostingQuestionsQueryVariables>(
    'PostingQuestions',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      return HttpResponse.json({
        data: { posting: { id: String(variables.id), questions: SAMPLE_POSTING_QUESTIONS } },
      })
    },
  ),
  graphqlApi.query<MyDocEvaluationQuery, MyDocEvaluationQueryVariables>(
    'MyDocEvaluation',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const found = findApplication(String(variables.applicationId))

      if (!found) {
        return HttpResponse.json(errorBody(...EVALUATION_NOT_FOUND_ERROR))
      }

      return HttpResponse.json({
        data: { myDocEvaluation: getMyEvaluation(found.application, found.posting.status) },
      })
    },
  ),
  // 남은 수·다음 지원자는 저장한 지원서가 속한 공고 기준
  graphqlApi.mutation<SaveDocEvaluationMutation, SaveDocEvaluationMutationVariables>(
    'SaveDocEvaluation',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { input, submit } = variables
      const found = findApplication(String(input.applicationId))

      if (!found) {
        return HttpResponse.json(errorBody(...EVALUATION_NOT_FOUND_ERROR))
      }

      const { posting, application, applications } = found
      if (posting.docResultConfirmedAt) {
        return HttpResponse.json(errorBody(...RESULT_CONFIRMED_ERROR))
      }

      const scores = Array.isArray(input.scores) ? input.scores : input.scores ? [input.scores] : []
      const evaluation: MyDocEvaluationFieldsFragment = {
        id: `evaluation-${application.id}`,
        status: submit ? 'SAVED' : 'DRAFT',
        opinion: input.opinion ?? null,
        memo: input.memo ?? null,
        scores: scores.map(({ questionId, score }) => ({
          question: { id: String(questionId) },
          score,
        })),
        updatedAt: new Date().toISOString(),
      }
      saveMyEvaluation(application.id, evaluation)

      const unevaluated = applications
        .filter((item) => getMyEvaluationStatus(item, posting.status) !== 'SAVED')
        .sort((a, b) => compareApplicants(a, b, 'SUBMITTED_DESC'))

      return HttpResponse.json({
        data: {
          saveDocEvaluation: {
            evaluation,
            remainingCount: unevaluated.length,
            nextUnevaluatedApplicationId:
              unevaluated.find(({ id }) => id !== application.id)?.id ?? null,
          },
        },
      })
    },
  ),
]

export { documentReviewHandlers }

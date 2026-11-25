import { delay, HttpResponse } from 'msw'
import { getManagedPostingSample } from '@/features/posting/mocks/managedPostingHandlers'
import { findOrganizationPostingSample } from '@/features/posting/mocks/organizationPostingSamples'
import { UXUX_POSITIONS } from '@/features/posting/mocks/postingDetailHandlers'
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
import { getApplicationDetailSample } from './documentEvaluationSample'
import { DOCUMENT_REVIEW_SAMPLE } from './documentReviewSample'

// 서술형 답변 뒤에 활동 경험, 그 뒤 파일·링크 문항
const ACTIVITY_SORT_ORDER = 100
const FILE_LINK_SORT_ORDER = 101

// 평가 샘플의 점수, 임시저장 상태로 시작하는 지원자
const INITIAL_SAVED_SCORE = 4
const DRAFT_APPLICANT_ID = '3'
// 학교 인증 전이라 제출 시점 프로필에 학교가 없는 지원자
const UNVERIFIED_SCHOOL_APPLICANT_ID = '2'

type SampleApplicant = (typeof DOCUMENT_REVIEW_SAMPLE)[number]

// 공고의 서술형 문항 순서, 샘플마다 답한 서술형 문항 수가 달라 나머지는 비운 문항
const SAMPLE_TEXT_QUESTION_IDS = ['motivation', 'conflict', 'strength', 'failure', 'tool', 'plan']
const ACTIVITY_QUESTION_ID = 'activity'
const FILE_LINK_QUESTION_IDS = ['work-files', 'reference-links'] as const

// 활동 경험(선택)을 비운 지원자, 백엔드처럼 비운 문항은 answers에서 뺌
const SKIPPED_ANSWER_APPLICANT_ID = '4'

// 모든 샘플 공고가 같은 공통 문항 사용
const SAMPLE_POSTING_QUESTIONS: PostingQuestionsQuery['posting']['questions'] = [
  ...SAMPLE_TEXT_QUESTION_IDS.map((id, index) => ({
    id,
    type: 'TEXT' as const,
    sortOrder: index,
    position: null,
  })),
  { id: ACTIVITY_QUESTION_ID, type: 'ACTIVITY', sortOrder: ACTIVITY_SORT_ORDER, position: null },
  ...FILE_LINK_QUESTION_IDS.map((id, index) => ({
    id,
    type: 'FILE_LINK' as const,
    sortOrder: FILE_LINK_SORT_ORDER + index,
    position: null,
  })),
]

// 문항 ID는 답변 ID와 같게, 서술형 뒤에 활동 경험과 파일·링크 문항
function getSampleAnswers(applicantId: string) {
  const detail = getApplicationDetailSample(applicantId)
  const textAnswers = detail.answers.map(({ id, question, answer, maxLength }) => ({
    id,
    question: {
      id,
      type: 'TEXT' as const,
      title: question,
      description: null,
      required: true,
      maxLength,
      sortOrder: SAMPLE_TEXT_QUESTION_IDS.indexOf(id),
      options: null,
    },
    content: answer,
    attachments: [],
  }))
  const activityAnswer = {
    id: ACTIVITY_QUESTION_ID,
    question: {
      id: ACTIVITY_QUESTION_ID,
      type: 'ACTIVITY' as const,
      title: '활동 경험을 입력해 주세요.',
      description: '최근 활동부터 최대 3개까지 입력해 주세요.',
      required: false,
      maxLength: null,
      sortOrder: ACTIVITY_SORT_ORDER,
      options: {
        activityFields: [
          'NAME' as const,
          'PERIOD' as const,
          'ROLE' as const,
          'ACHIEVEMENT' as const,
        ],
      },
    },
    content: JSON.stringify(detail.activities),
    attachments: [],
  }
  const fileLinkAnswers = [
    {
      id: FILE_LINK_QUESTION_IDS[0],
      title: '작업물 파일을 첨부해 주세요.',
      attachments: detail.files,
    },
    {
      id: FILE_LINK_QUESTION_IDS[1],
      title: '참고할 수 있는 링크를 첨부해 주세요.',
      attachments: detail.links,
    },
  ].map(({ id, title, attachments }, index) => ({
    id,
    question: {
      id,
      type: 'FILE_LINK' as const,
      title,
      description: null,
      required: true,
      maxLength: null,
      sortOrder: FILE_LINK_SORT_ORDER + index,
      options: null,
    },
    content: null,
    attachments,
  }))

  const answers = [...textAnswers, activityAnswer, ...fileLinkAnswers]
  return applicantId === SKIPPED_ANSWER_APPLICANT_ID
    ? answers.filter(({ question }) => question.id !== ACTIVITY_QUESTION_ID)
    : answers
}

// 저장한 평가가 새로고침 전까지 목록·칩·패널에 이어지도록 지원서 ID별로 메모리에 보관
const evaluationsByApplicationId = new Map<string, MyDocEvaluationFieldsFragment>()

// 목록 샘플의 평가 완료 지원자는 저장 완료, 3번은 일부만 입력한 작성 중
function createInitialEvaluation(applicant: SampleApplicant): MyDocEvaluationFieldsFragment | null {
  const updatedAt = `${applicant.submittedAt}:00+09:00`
  if (applicant.isEvaluated) {
    return {
      id: `evaluation-${applicant.id}`,
      status: 'SAVED',
      opinion: 'PASS',
      memo: null,
      scores: getSampleAnswers(applicant.id).map(({ question }) => ({
        question: { id: question.id },
        score: INITIAL_SAVED_SCORE,
      })),
      updatedAt,
    }
  }
  if (applicant.id === DRAFT_APPLICANT_ID) {
    return {
      id: `evaluation-${applicant.id}`,
      status: 'DRAFT',
      opinion: 'HOLD',
      memo: null,
      scores: [{ question: { id: 'motivation' }, score: INITIAL_SAVED_SCORE }],
      updatedAt,
    }
  }
  return null
}

function getEvaluation(applicant: SampleApplicant) {
  return evaluationsByApplicationId.get(applicant.id) ?? createInitialEvaluation(applicant)
}

function getMyEvaluationStatus(applicant: SampleApplicant): MyDocEvaluationStatus {
  return getEvaluation(applicant)?.status ?? 'NONE'
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
const EVALUATION_NOT_FOUND_ERROR = ['EVALUATION_404', '지원서를 찾을 수 없습니다.'] as const

function findApplicant(applicationId: string) {
  return DOCUMENT_REVIEW_SAMPLE.find(({ id }) => id === applicationId)
}

// 저장 요청엔 공고 ID가 없어 마지막으로 목록·칩을 조회한 공고의 지원자로 남은 수·다음 지원자 계산
let evaluatingApplicants = DOCUMENT_REVIEW_SAMPLE

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

      evaluatingApplicants = DOCUMENT_REVIEW_SAMPLE.slice(0, sample.applicantCount)
      // 포지션 숫자는 검색어만, 탭 숫자는 검색어·포지션 필터만 적용
      const searched = evaluatingApplicants.filter(({ name }) => name.includes(keyword ?? ''))
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
  // 목록과 같은 지원자·평가 상태, 화면은 조건 없이 조회해 전체·제출 최신순
  graphqlApi.query<DocEvaluationApplicationChipsQuery, DocEvaluationApplicationChipsQueryVariables>(
    'DocEvaluationApplicationChips',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const sample = getManagedPostingSample(postingId) && findOrganizationPostingSample(postingId)

      if (!sample) {
        return HttpResponse.json(errorBody(...POSTING_NOT_FOUND_ERROR))
      }

      evaluatingApplicants = DOCUMENT_REVIEW_SAMPLE.slice(0, sample.applicantCount)
      const chips = [...evaluatingApplicants]
        .sort((a, b) => compareApplicants(a, b, 'SUBMITTED_DESC'))
        .map((applicant) => ({
          application: { id: applicant.id, user: { name: applicant.name } },
          myEvaluationStatus: getMyEvaluationStatus(applicant),
        }))

      return HttpResponse.json({ data: { docEvaluationApplicationChips: chips } })
    },
  ),
  // 지원서 요청에 공고 ID가 없어 포지션은 항상 표시
  graphqlApi.query<
    DocEvaluationApplicationDetailQuery,
    DocEvaluationApplicationDetailQueryVariables
  >('DocEvaluationApplicationDetail', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    const applicant = DOCUMENT_REVIEW_SAMPLE.find(({ id }) => id === String(variables.id))

    if (!applicant) {
      return HttpResponse.json(errorBody('APPLICATION_404', '지원서를 찾을 수 없습니다.'))
    }

    const detail = getApplicationDetailSample(applicant.id)
    const position = UXUX_POSITIONS.find(({ id }) => id === applicant.position)

    return HttpResponse.json({
      data: {
        application: {
          id: applicant.id,
          user: { name: applicant.name },
          position: position ? { id: position.id, name: position.name } : null,
          profileSnapshot: {
            name: applicant.name,
            phone: '01000000000',
            school: applicant.id === UNVERIFIED_SCHOOL_APPLICANT_ID ? null : '성균관대학교',
          },
          availableTimes: detail.availableTimes,
          answers: getSampleAnswers(applicant.id),
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
      const applicant = findApplicant(String(variables.applicationId))

      if (!applicant) {
        return HttpResponse.json(errorBody(...EVALUATION_NOT_FOUND_ERROR))
      }

      return HttpResponse.json({ data: { myDocEvaluation: getEvaluation(applicant) } })
    },
  ),
  graphqlApi.mutation<SaveDocEvaluationMutation, SaveDocEvaluationMutationVariables>(
    'SaveDocEvaluation',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { input, submit } = variables
      const applicant = findApplicant(String(input.applicationId))

      if (!applicant) {
        return HttpResponse.json(errorBody(...EVALUATION_NOT_FOUND_ERROR))
      }

      const scores = Array.isArray(input.scores) ? input.scores : input.scores ? [input.scores] : []
      const evaluation: MyDocEvaluationFieldsFragment = {
        id: `evaluation-${applicant.id}`,
        status: submit ? 'SAVED' : 'DRAFT',
        opinion: input.opinion ?? null,
        memo: input.memo ?? null,
        scores: scores.map(({ questionId, score }) => ({
          question: { id: String(questionId) },
          score,
        })),
        updatedAt: new Date().toISOString(),
      }
      evaluationsByApplicationId.set(applicant.id, evaluation)

      const unevaluated = evaluatingApplicants
        .filter((item) => getMyEvaluationStatus(item) !== 'SAVED')
        .sort((a, b) => compareApplicants(a, b, 'SUBMITTED_DESC'))

      return HttpResponse.json({
        data: {
          saveDocEvaluation: {
            evaluation,
            remainingCount: unevaluated.length,
            nextUnevaluatedApplicationId:
              unevaluated.find(({ id }) => id !== applicant.id)?.id ?? null,
          },
        },
      })
    },
  ),
]

export { documentReviewHandlers }

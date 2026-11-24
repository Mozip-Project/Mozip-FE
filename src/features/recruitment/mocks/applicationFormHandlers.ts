import { delay, HttpResponse } from 'msw'
import {
  createPostingSample,
  POSTING_SAMPLE_ID,
} from '@/features/posting/mocks/postingDetailHandlers'
import { getMockAccount } from '@/features/user/mocks/userHandlers'
import type {
  AnswerInput,
  ApplicantProfileQuery,
  ApplicantProfileQueryVariables,
  PostingApplicationFormQuery,
  PostingApplicationFormQueryVariables,
  PostingMyApplicationsQuery,
  PostingMyApplicationsQueryVariables,
  SaveApplicationDraftMutation,
  SaveApplicationDraftMutationVariables,
  SubmitApplicationMutation,
  SubmitApplicationMutationVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { getSeoulIsoDate } from '@/utils/date'

type PostingResponse = PostingApplicationFormQuery['posting']
type QuestionResponse = PostingResponse['questions'][number]
type QuestionSetting = Omit<QuestionResponse, 'id' | 'title' | 'sortOrder' | 'position'>

const TEXT_QUESTION: QuestionSetting = {
  type: 'TEXT',
  description: null,
  required: true,
  maxLength: 500,
  options: null,
}

const ACTIVITY_QUESTION: QuestionSetting = {
  type: 'ACTIVITY',
  description: null,
  required: true,
  maxLength: null,
  options: {
    activityFields: ['NAME', 'PERIOD', 'ROLE', 'ACHIEVEMENT'],
    maxEntries: 3,
    acceptFile: null,
    acceptLink: null,
    fileTypes: null,
  },
}

const PORTFOLIO_QUESTION: QuestionSetting = {
  type: 'FILE_LINK',
  description: '파일과 링크를 함께 올릴 수 있어요',
  required: true,
  maxLength: null,
  options: {
    activityFields: null,
    maxEntries: null,
    acceptFile: true,
    acceptLink: true,
    fileTypes: ['PDF', 'IMAGE'],
  },
}

// 공고 상세 MSW 문항 id별 설정, 없는 id는 필수 장문형 500자
const QUESTION_SETTING_BY_ID: Record<string, QuestionSetting> = {
  'planning-experience': ACTIVITY_QUESTION,
  'design-portfolio': PORTFOLIO_QUESTION,
  'planning-portfolio': PORTFOLIO_QUESTION,
  // 학생회 집행부 공고의 선택 문항
  experience: { ...TEXT_QUESTION, required: false, maxLength: 1000 },
}

// Figma 지원서 2단계 면접 가능 시간, 공고 상세 MSW 면접 날짜 순서대로
const INTERVIEW_BLOCKS = [
  { startTime: '13:00:00', endTime: '17:00:00' },
  { startTime: '14:00:00', endTime: '17:00:00' },
  { startTime: '13:00:00', endTime: '15:00:00' },
]

// 공고 상세 MSW 응답에 지원서 작성에만 쓰는 문항 설정·면접 블록·사진 필수를 더함
function createApplicationFormSample(postingId: string): PostingResponse | undefined {
  const detail = createPostingSample(postingId, getSeoulIsoDate(new Date()))

  if (!detail) {
    return undefined
  }

  return {
    id: detail.id,
    title: detail.title,
    noPosition: detail.noPosition,
    hasInterview: detail.hasInterview,
    profilePhotoRequired: postingId === POSTING_SAMPLE_ID.photoRequired,
    positions: detail.positions,
    questions: detail.questions.map((question) => ({
      ...question,
      ...(QUESTION_SETTING_BY_ID[question.id] ?? TEXT_QUESTION),
    })),
    interviewTimeRanges: detail.interviewTimeRanges.flatMap(({ date }, dayIndex) => {
      const block = INTERVIEW_BLOCKS[dayIndex]
      return block ? [{ ...block, date, closedSlots: [], position: null }] : []
    }),
  }
}

const ALREADY_SUBMITTED_RESPONSE = {
  errors: [{ message: '이미 제출한 지원서입니다.', extensions: { code: 'APPLICATION_409' } }],
  data: null,
}

type MyApplicationResponse = PostingMyApplicationsQuery['posting']['myApplications'][number]
type MockApplication = Omit<MyApplicationResponse, 'id' | 'position'> & {
  postingId: string
  positionId: string | null
}

// 공고 상세 MSW의 지원 완료 공고에 맞춘 제출 지원서
const SUBMITTED_POSITION_IDS_BY_POSTING_ID: Record<string, (string | null)[]> = {
  [POSTING_SAMPLE_ID.partiallyApplied]: ['design'],
  [POSTING_SAMPLE_ID.fullyApplied]: ['design', 'development', 'planning'],
  [POSTING_SAMPLE_ID.directApplied]: [null],
}

// 이어 쓰기 확인용 임시 저장, 장문형·활동 경험·링크·면접 시간이 모두 있는 기획 포지션
const DRAFT_POSTING_ID = POSTING_SAMPLE_ID.photoRequired
const DRAFT_POSITION_ID = 'planning'

// 명세상 공고당 1개지만 포지션별 지원 완료를 보여 주려고 포지션마다 지원서 생성
function toApplicationId(postingId: string, positionId: string | null) {
  return `application-${postingId}-${positionId ?? 'direct'}`
}

function createDraftSample(): MockApplication {
  const firstInterviewDate =
    createApplicationFormSample(DRAFT_POSTING_ID)?.interviewTimeRanges[0]?.date

  return {
    postingId: DRAFT_POSTING_ID,
    positionId: DRAFT_POSITION_ID,
    submittedAt: null,
    updatedAt: new Date().toISOString(),
    availableTimes: firstInterviewDate
      ? [`${firstInterviewDate}T13:00:00+09:00`, `${firstInterviewDate}T13:30:00+09:00`]
      : [],
    answers: [
      {
        question: { id: 'motivation' },
        content: '서비스 기획을 직접 해 보고 싶어 지원했어요.',
        attachments: [],
      },
      {
        question: { id: 'planning-experience' },
        content: JSON.stringify([
          { name: '교내 해커톤', period: '2026.05 ~ 2026.06', role: '기획', achievement: '' },
        ]),
        attachments: [],
      },
      {
        question: { id: 'planning-portfolio' },
        content: null,
        attachments: [{ type: 'LINK', url: 'https://example.com/portfolio' }],
      },
    ],
  }
}

function createInitialApplications() {
  const now = new Date().toISOString()
  const submitted = Object.entries(SUBMITTED_POSITION_IDS_BY_POSTING_ID).flatMap(
    ([postingId, positionIds]) =>
      positionIds.map((positionId): [string, MockApplication] => [
        toApplicationId(postingId, positionId),
        {
          postingId,
          positionId,
          submittedAt: now,
          updatedAt: now,
          availableTimes: [],
          answers: [],
        },
      ]),
  )

  return new Map<string, MockApplication>([
    ...submitted,
    [toApplicationId(DRAFT_POSTING_ID, DRAFT_POSITION_ID), createDraftSample()],
  ])
}

// 링크만 보관, 파일은 업로드 API가 없어 저장 입력에 없음
function toAnswerResponses(answers: readonly AnswerInput[]): MyApplicationResponse['answers'] {
  return answers.map(({ questionId, content, attachments }) => ({
    question: { id: String(questionId) },
    content: content ?? null,
    attachments: (attachments ?? []).flatMap(({ url }) =>
      url ? [{ type: 'LINK' as const, url }] : [],
    ),
  }))
}

// 서버를 다시 시작하면 초기화, 브라우저 MSW는 새로고침마다 초기화
const applications = createInitialApplications()

function isRecruiting(recruitStartAt: string | null, recruitEndAt: string | null) {
  const now = Date.now()
  return (
    recruitStartAt !== null &&
    recruitEndAt !== null &&
    new Date(recruitStartAt).getTime() <= now &&
    now <= new Date(recruitEndAt).getTime()
  )
}

const applicationFormHandlers = [
  graphqlApi.query<PostingApplicationFormQuery, PostingApplicationFormQueryVariables>(
    'PostingApplicationForm',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const posting = createApplicationFormSample(String(variables.id))

      if (!posting) {
        return HttpResponse.json({
          errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
          data: null,
        })
      }
      return HttpResponse.json({ data: { posting } })
    },
  ),
  // 마이페이지 계정 MSW와 같은 회원, 프로필 사진은 없음
  graphqlApi.query<ApplicantProfileQuery, ApplicantProfileQueryVariables>(
    'ApplicantProfile',
    async () => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const { id, name, phone, school, schoolVerification } = getMockAccount()

      return HttpResponse.json({
        data: { me: { id, name, phone, profileImageUrl: null, school, schoolVerification } },
      })
    },
  ),
  graphqlApi.query<PostingMyApplicationsQuery, PostingMyApplicationsQueryVariables>(
    'PostingMyApplications',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.id)
      const myApplications = [...applications]
        .filter(([, application]) => application.postingId === postingId)
        .map(([id, { postingId: _postingId, positionId, ...application }]) => ({
          ...application,
          id,
          position: positionId ? { id: positionId } : null,
        }))

      return HttpResponse.json({ data: { posting: { id: postingId, myApplications } } })
    },
  ),
  graphqlApi.mutation<SaveApplicationDraftMutation, SaveApplicationDraftMutationVariables>(
    'SaveApplicationDraft',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const postingId = String(variables.postingId)
      const posting = createPostingSample(postingId, getSeoulIsoDate(new Date()))

      if (!posting) {
        return HttpResponse.json({
          errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
          data: null,
        })
      }
      // 모집 예정·마감 목데이터로 저장 실패 확인
      if (!isRecruiting(posting.recruitStartAt, posting.recruitEndAt)) {
        return HttpResponse.json({
          errors: [{ message: '모집 기간이 아닙니다.', extensions: { code: 'POSTING_409' } }],
          data: null,
        })
      }
      const positionId = variables.input.positionId ? String(variables.input.positionId) : null
      const id = toApplicationId(postingId, positionId)

      if (applications.get(id)?.submittedAt) {
        return HttpResponse.json(ALREADY_SUBMITTED_RESPONSE)
      }
      const updatedAt = new Date().toISOString()
      const { answers, availableTimes } = variables.input

      applications.set(id, {
        postingId,
        positionId,
        submittedAt: null,
        updatedAt,
        answers: toAnswerResponses(answers),
        availableTimes: availableTimes ?? [],
      })
      return HttpResponse.json({ data: { saveApplicationDraft: { id, updatedAt } } })
    },
  ),
  // 필수 문항 검증은 화면에서 막아 생략
  graphqlApi.mutation<SubmitApplicationMutation, SubmitApplicationMutationVariables>(
    'SubmitApplication',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      const id = String(variables.id)
      const application = applications.get(id)

      if (!application) {
        return HttpResponse.json({
          errors: [
            { message: '지원서를 찾을 수 없습니다.', extensions: { code: 'APPLICATION_404' } },
          ],
          data: null,
        })
      }
      if (application.submittedAt) {
        return HttpResponse.json(ALREADY_SUBMITTED_RESPONSE)
      }
      applications.set(id, { ...application, submittedAt: new Date().toISOString() })
      return HttpResponse.json({ data: { submitApplication: { id } } })
    },
  ),
]

export { applicationFormHandlers }

import {
  createPostingSample,
  POSTING_SAMPLE_ID,
} from '@/features/posting/mocks/postingDetailHandlers'
import type {
  DocResult,
  FinalResult,
  PostingApplicationFormQuery,
  PostingMyApplicationsQuery,
  PostingStatus,
} from '@/gql/graphql'
import { getSeoulIsoDate } from '@/utils/date'
import { getApplicationDetailSample } from './documentEvaluationSample'

// 지원서 작성·내 지원·제출한 지원서 MSW가 같은 지원서를 보도록 한곳에서 관리

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

// 공고 상세 MSW 응답에 지원서 작성에만 쓰는 문항 설정·면접 블록을 더함
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
    profilePhotoRequired: false,
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

type MyApplicationResponse = PostingMyApplicationsQuery['posting']['myApplications'][number]
type MockApplication = Omit<MyApplicationResponse, 'id' | 'position'> & {
  postingId: string
  positionId: string | null
}

// 공고 상세 MSW의 지원 완료 공고에 맞춘 제출 지원서
const SUBMITTED_POSITION_IDS_BY_POSTING_ID: Record<string, (string | null)[]> = {
  [POSTING_SAMPLE_ID.directApplied]: [null],
}

// 명세상 공고당 1개지만 포지션별 지원 완료를 보여 주려고 포지션마다 지원서 생성
function toApplicationId(postingId: string, positionId: string | null) {
  return `application-${postingId}-${positionId ?? 'direct'}`
}

type ProgressSample = {
  submittedAt: string
  postingStatus: PostingStatus
  docResult: DocResult
  finalResult: FinalResult
}

const DEFAULT_PROGRESS = {
  postingStatus: 'RECRUITING',
  docResult: 'PENDING',
  finalResult: 'PENDING',
} satisfies Omit<ProgressSample, 'submittedAt'>

// 내 지원 카드의 단계별 모습 확인용, 공고 상세와 달리 지원서마다 다른 모집 단계
const PROGRESS_SAMPLE_BY_APPLICATION_ID: Partial<Record<string, ProgressSample>> = {
  // 면접 없는 모집, 최종 발표일 미정
  [toApplicationId(POSTING_SAMPLE_ID.directApplied, null)]: {
    ...DEFAULT_PROGRESS,
    submittedAt: '2026-10-03T09:15:00+09:00',
    postingStatus: 'DOC_REVIEW',
  },
}

// 화면에서 새로 제출한 지원서는 모집 중·결과 전
function getApplicationProgress(applicationId: string) {
  return PROGRESS_SAMPLE_BY_APPLICATION_ID[applicationId] ?? DEFAULT_PROGRESS
}

// 장문형 답변은 서류 평가 기본 샘플에서, 없는 문항은 공통 문구
const SAMPLE_TEXT_ANSWER_BY_QUESTION_ID = new Map(
  getApplicationDetailSample('').answers.map(({ id, answer }) => [id, answer]),
)
const DEFAULT_TEXT_ANSWER = '맡은 일을 끝까지 해내는 경험을 쌓고 싶어 지원했어요.'
const SAMPLE_ACTIVITIES = getApplicationDetailSample('').activities
const SAMPLE_LINK_URL = 'https://portfolio.example.com/mozip'

// 필수 문항만 답한 제출 지원서, 선택 문항은 비워 미응답 카드 확인
function createSubmittedSample(postingId: string, positionId: string | null): MockApplication {
  const posting = createApplicationFormSample(postingId)
  const submittedAt =
    PROGRESS_SAMPLE_BY_APPLICATION_ID[toApplicationId(postingId, positionId)]?.submittedAt ??
    new Date().toISOString()
  const questions = (posting?.questions ?? []).filter(
    ({ required, position }) => required && (position === null || position.id === positionId),
  )
  const firstInterviewDate = posting?.interviewTimeRanges[0]?.date

  return {
    postingId,
    positionId,
    submittedAt,
    updatedAt: submittedAt,
    availableTimes: firstInterviewDate
      ? [`${firstInterviewDate}T13:00:00+09:00`, `${firstInterviewDate}T13:30:00+09:00`]
      : [],
    answers: questions.flatMap((question): MockApplication['answers'] => {
      switch (question.type) {
        case 'TEXT':
          return [
            {
              question: { id: question.id },
              content: SAMPLE_TEXT_ANSWER_BY_QUESTION_ID.get(question.id) ?? DEFAULT_TEXT_ANSWER,
              attachments: [],
            },
          ]
        case 'ACTIVITY':
          return [
            {
              question: { id: question.id },
              content: JSON.stringify(SAMPLE_ACTIVITIES),
              attachments: [],
            },
          ]
        case 'FILE_LINK':
          return [
            {
              question: { id: question.id },
              content: null,
              attachments: [{ type: 'LINK', url: SAMPLE_LINK_URL }],
            },
          ]
        case 'SINGLE_CHOICE':
        case 'MULTI_CHOICE':
        case 'TABLE':
          return []
      }
    }),
  }
}

function createInitialApplications() {
  const submitted = Object.entries(SUBMITTED_POSITION_IDS_BY_POSTING_ID).flatMap(
    ([postingId, positionIds]) =>
      positionIds.map((positionId): [string, MockApplication] => [
        toApplicationId(postingId, positionId),
        createSubmittedSample(postingId, positionId),
      ]),
  )

  return new Map<string, MockApplication>(submitted)
}

// 서버를 다시 시작하면 초기화, 브라우저 MSW는 새로고침마다 초기화
const applicantApplications = createInitialApplications()

export {
  applicantApplications,
  createApplicationFormSample,
  getApplicationProgress,
  toApplicationId,
}
export type { MockApplication }

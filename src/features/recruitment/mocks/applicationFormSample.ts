import type { PostingApplication, PostingPosition, PostingQuestion } from '@/features/posting/types'
import { addDaysToIsoDate } from '@/utils/date'

// TODO: 지원서 작성 API 확정 후 삭제
// 공고 상세 MSW와 같은 id
const SAMPLE_POSTING_ID = {
  open: 'uxux-14',
  upcoming: 'uxux-14-upcoming',
  closed: 'uxux-14-closed',
  partiallyApplied: 'uxux-14-partially-applied',
  fullyApplied: 'uxux-14-fully-applied',
  missingInfo: 'uxux-14-missing-info',
  // 지원서 작성 "프로필 이미지 필수" 확인용
  photoRequired: 'uxux-14-photo-required',
  supporters: 'uxux-supporters',
  direct: 'sw-council-staff',
  directApplied: 'sw-council-staff-applied',
  directUpcoming: 'sw-council-staff-upcoming',
  directClosed: 'sw-council-staff-closed',
} as const

type ApplicationFormSample = {
  title: string
  questions: PostingQuestion[]
  application: PostingApplication
  requiresProfilePhoto: boolean
}

const UXUX_POSITION_NAMES = ['디자인', '개발', '기획'] as const

const UXUX_INTERVIEW_START_OFFSET_DAYS = 6

const UXUX_MOTIVATION_QUESTION = {
  id: 'motivation',
  type: 'text',
  title: 'UXUX에 지원한 동기를 작성해 주세요.',
  description: null,
  isRequired: true,
  maxLength: 500,
} satisfies PostingQuestion

const UXUX_CONFLICT_QUESTION = {
  id: 'conflict',
  type: 'text',
  title: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.',
  description: null,
  isRequired: true,
  maxLength: 500,
} satisfies PostingQuestion

const UXUX_EXPERIENCE_QUESTION = {
  id: 'experience',
  type: 'activity',
  title: '활동 경험을 입력해 주세요.',
  description: null,
  isRequired: true,
  activityFields: ['period', 'role', 'achievement'],
  maxActivityCount: 3,
} satisfies PostingQuestion

const UXUX_PORTFOLIO_QUESTION = {
  id: 'portfolio',
  type: 'file',
  title: '포트폴리오 링크 또는 파일',
  description: '파일과 링크를 함께 올릴 수 있어요',
  isRequired: true,
  acceptsFile: true,
  acceptsLink: true,
  fileTypes: ['pdf', 'image'],
} satisfies PostingQuestion

// Figma 지원서 2단계 면접 가능 시간, 면접 첫날부터 날짜별 30분 칸 시작 시각
const UXUX_INTERVIEW_SLOT_TIMES = [
  ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  ['13:00', '13:30', '14:00', '14:30'],
]

function createUxuxInterviewTimeQuestion(interviewStartDate: string): PostingQuestion {
  return {
    id: 'interview-time',
    type: 'availability',
    title: '면접 가능 시간 선택',
    description: '면접에 참석할 수 있는 시간을 모두 골라 주세요.',
    isRequired: true,
    interviewSlots: UXUX_INTERVIEW_SLOT_TIMES.flatMap((times, dayIndex) =>
      times.map((time) => `${addDaysToIsoDate(interviewStartDate, dayIndex)}T${time}`),
    ),
  }
}

// 기획은 Figma 문항, 디자인·개발은 포지션별 차이 확인용
const UXUX_POSITION_QUESTION_ID_PREFIX = {
  디자인: 'design',
  개발: 'development',
  기획: 'planning',
} satisfies Record<(typeof UXUX_POSITION_NAMES)[number], string>

function getUxuxQuestionsByPosition(interviewStartDate: string) {
  const interviewTimeQuestion = createUxuxInterviewTimeQuestion(interviewStartDate)

  return {
    디자인: [
      UXUX_MOTIVATION_QUESTION,
      UXUX_CONFLICT_QUESTION,
      UXUX_PORTFOLIO_QUESTION,
      interviewTimeQuestion,
    ],
    개발: [UXUX_MOTIVATION_QUESTION, UXUX_CONFLICT_QUESTION, interviewTimeQuestion],
    기획: [
      UXUX_MOTIVATION_QUESTION,
      UXUX_CONFLICT_QUESTION,
      UXUX_EXPERIENCE_QUESTION,
      UXUX_PORTFOLIO_QUESTION,
      interviewTimeQuestion,
    ],
  } satisfies Record<(typeof UXUX_POSITION_NAMES)[number], PostingQuestion[]>
}

function getUxuxPositions(
  endDate: string,
  appliedNames: readonly string[] = [],
  appliedAt: string | null = null,
): PostingPosition[] {
  const questionsByPosition = getUxuxQuestionsByPosition(
    addDaysToIsoDate(endDate, UXUX_INTERVIEW_START_OFFSET_DAYS),
  )

  return UXUX_POSITION_NAMES.map((name) => ({
    id: name,
    name,
    appliedAt: appliedNames.includes(name) ? appliedAt : null,
    // 운영진 공고 작성은 포지션마다 문항을 따로 만들어 제목이 같아도 id가 다름
    questions: questionsByPosition[name].map((question) => ({
      ...question,
      id: `${UXUX_POSITION_QUESTION_ID_PREFIX[name]}-${question.id}`,
    })),
  }))
}

function createUxuxSample(
  endDate: string,
  overrides: Partial<ApplicationFormSample> = {},
): ApplicationFormSample {
  return {
    title: 'UXUX 14기 신입 부원 모집',
    questions: [],
    application: { type: 'byPosition', positions: getUxuxPositions(endDate) },
    requiresProfilePhoto: false,
    ...overrides,
  }
}

function createSwCouncilSample(
  application: PostingApplication = { type: 'direct', appliedAt: null },
): ApplicationFormSample {
  return {
    title: '집행부원 추가 모집',
    questions: [
      {
        id: 'motivation',
        type: 'text',
        title: '집행부에 지원한 동기를 작성해 주세요.',
        description: null,
        isRequired: true,
        maxLength: 500,
      },
      {
        id: 'experience',
        type: 'text',
        title: '행사를 기획하거나 운영한 경험이 있다면 알려 주세요.',
        description: null,
        isRequired: false,
        maxLength: 1000,
      },
    ],
    application,
    requiresProfilePhoto: false,
  }
}

// today는 한국 날짜(YYYY-MM-DD)
function getApplicationFormSample(
  postingId: string,
  today: string,
): ApplicationFormSample | undefined {
  const openEndDate = addDaysToIsoDate(today, 1)
  const appliedAt = addDaysToIsoDate(today, -12)
  const ID = SAMPLE_POSTING_ID

  switch (postingId) {
    case ID.open:
    case ID.missingInfo:
      return createUxuxSample(openEndDate)
    case ID.upcoming:
      return createUxuxSample(addDaysToIsoDate(today, 17))
    case ID.closed:
      return createUxuxSample(addDaysToIsoDate(today, -1))
    case ID.partiallyApplied:
      return createUxuxSample(openEndDate, {
        application: {
          type: 'byPosition',
          positions: getUxuxPositions(openEndDate, ['디자인'], appliedAt),
        },
      })
    case ID.fullyApplied:
      return createUxuxSample(openEndDate, {
        application: {
          type: 'byPosition',
          positions: getUxuxPositions(openEndDate, UXUX_POSITION_NAMES, appliedAt),
        },
      })
    case ID.photoRequired:
      return createUxuxSample(openEndDate, { requiresProfilePhoto: true })
    case ID.supporters:
      return createUxuxSample(openEndDate, {
        title: '홍보 서포터즈 모집',
        questions: [
          {
            id: 'motivation',
            type: 'text',
            title: '홍보 서포터즈에 지원한 동기를 작성해 주세요.',
            description: null,
            isRequired: true,
            maxLength: 500,
          },
        ],
        application: { type: 'direct', appliedAt: null },
      })
    case ID.direct:
    case ID.directUpcoming:
    case ID.directClosed:
      return createSwCouncilSample()
    case ID.directApplied:
      return createSwCouncilSample({ type: 'direct', appliedAt })
    default:
      return undefined
  }
}

export { getApplicationFormSample }

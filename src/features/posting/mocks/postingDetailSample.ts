import type {
  PostingApplication,
  PostingContentBlock,
  PostingDetail,
  PostingOrganization,
  PostingPosition,
  PostingQuestion,
} from '@/features/posting/types'
import { addDaysToIsoDate } from '@/utils/date'

// TODO: 공고 상세 API 확정 후 삭제
// Figma 공고 상세 케이스별 샘플, 날짜는 D-day·모집 상태 확인용으로 오늘 기준 상대값
const POSTING_DETAIL_SAMPLE_ID = {
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

const UXUX_POSITION_NAMES = ['디자인', '개발', '기획'] as const

// 홍보 서포터즈 공고(supporters)와 같은 모집 기간
const UXUX_SUPPORTERS_DAYS_LEFT = 12

function createUxuxOrganization(today: string): PostingOrganization {
  const supportersSchedule = getUxuxSchedule(addDaysToIsoDate(today, UXUX_SUPPORTERS_DAYS_LEFT))

  return {
    name: 'UXUX',
    // TODO: 로고 이미지 호스트 확정 후 샘플 이미지 주소로 교체
    logoUrl: null,
    activityType: 'club',
    scope: 'campus',
    introduction: '성균관대 UI/UX 디자인 동아리 14기 모집',
    activityFields: ['it', 'design'],
    keywords: ['UX', '디자인', '피그마', '프로토타이핑'],
    links: ['https://www.instagram.com/uxux_official', 'https://uxux.notion.site'],
    ongoingPostings: [
      {
        postingId: POSTING_DETAIL_SAMPLE_ID.supporters,
        title: '홍보 서포터즈 모집',
        recruitmentStartsAt: supportersSchedule.recruitmentStartsAt,
        recruitmentEndsAt: supportersSchedule.recruitmentEndsAt,
      },
    ],
  }
}

const SW_COUNCIL_ORGANIZATION = {
  name: '소프트웨어학과 학생회',
  logoUrl: null,
  activityType: 'studentCouncil',
  scope: 'campus',
  introduction: '소프트웨어학과 학우들의 의견을 학과에 전달하는 학생회',
  activityFields: [],
  keywords: ['학생회', '학과 행사'],
  links: ['https://example.com/sw-council'],
  ongoingPostings: [],
} satisfies PostingOrganization

const UXUX_CONTENT = [
  { type: 'heading', text: 'UXUX는 이런 동아리예요' },
  {
    type: 'paragraph',
    runs: [
      {
        text: '성균관대 UI/UX 디자인 동아리예요. 매 학기 실제 서비스를 함께 기획하고 디자인하며, 디자이너 · 개발자 · 기획자가 한 팀으로 프로젝트를 진행해요.',
      },
    ],
  },
  { type: 'heading', text: '이런 활동을 해요' },
  {
    type: 'list',
    items: [
      [{ text: '정기 세션', isBold: true }, { text: ' 매주 목요일 19:00, 신촌 · 온라인 병행' }],
      [{ text: '팀 프로젝트', isBold: true }, { text: ' 디자이너 · 개발자 · 기획자가 한 팀' }],
      [{ text: '데모데이', isBold: true }, { text: ' 학기 말 프로젝트 결과 공유' }],
    ],
  },
  { type: 'heading', text: '이런 분을 찾아요' },
  {
    type: 'list',
    items: [
      [{ text: '사용자 입장에서 문제를 고민하는 걸 좋아하는 분' }],
      [{ text: '매주 목요일 정기 세션에 참여할 수 있는 분' }],
      [{ text: '한 학기 동안 팀 프로젝트를 끝까지 함께할 분' }],
    ],
  },
] satisfies PostingContentBlock[]

const SW_COUNCIL_CONTENT = [
  { type: 'heading', text: '소프트웨어학과 학생회는 이런 일을 해요' },
  {
    type: 'paragraph',
    runs: [
      {
        text: '학과 행사를 기획 · 운영하고 학우들의 의견을 학과에 전달해요. 이번 학기 함께할 집행부원을 추가로 모집해요.',
      },
    ],
  },
  { type: 'heading', text: '이런 활동을 해요' },
  {
    type: 'list',
    items: [
      [{ text: '정기 회의', isBold: true }, { text: ' 매주 화요일 18:00, 학생회실' }],
      [{ text: '학과 행사', isBold: true }, { text: ' 학기 중 행사 2회 운영' }],
    ],
  },
  { type: 'heading', text: '이런 분을 찾아요' },
  {
    type: 'list',
    items: [
      [{ text: '학과 행사 기획 · 운영에 관심 있는 분' }],
      [{ text: '매주 화요일 정기 회의에 참여할 수 있는 분' }],
    ],
  },
] satisfies PostingContentBlock[]

function toSeoulDateTime(isoDate: string, time: string) {
  return `${isoDate}T${time}+09:00`
}

// Figma 일정 간격(마감 10/15 → 서류 결과 10/18 → 면접 10/21~23 → 최종 발표 10/27) 유지
function getUxuxSchedule(endDate: string) {
  const startDate = addDaysToIsoDate(endDate, -14)

  return {
    recruitmentStartsAt: toSeoulDateTime(startDate, '00:00:00'),
    recruitmentEndsAt: toSeoulDateTime(endDate, '23:59:59'),
    documentResultDate: addDaysToIsoDate(endDate, 3),
    interview: {
      method: '대면',
      startDate: addDaysToIsoDate(endDate, 6),
      endDate: addDaysToIsoDate(endDate, 8),
    },
    finalResultDate: addDaysToIsoDate(endDate, 12),
  }
}

const UXUX_MOTIVATION_QUESTION = { id: 'motivation', title: 'UXUX에 지원한 동기를 작성해 주세요.' }
const UXUX_PORTFOLIO_QUESTION = { id: 'portfolio', title: '포트폴리오 링크 또는 파일' }
const UXUX_INTERVIEW_TIME_QUESTION = { id: 'interview-time', title: '면접 가능 시간 선택' }

// 기획은 Figma 문항, 디자인·개발은 포지션별 차이 확인용
const UXUX_QUESTIONS_BY_POSITION = {
  디자인: [
    UXUX_MOTIVATION_QUESTION,
    { id: 'conflict', title: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.' },
    UXUX_PORTFOLIO_QUESTION,
    UXUX_INTERVIEW_TIME_QUESTION,
  ],
  개발: [
    UXUX_MOTIVATION_QUESTION,
    { id: 'conflict', title: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.' },
    UXUX_INTERVIEW_TIME_QUESTION,
  ],
  기획: [
    UXUX_MOTIVATION_QUESTION,
    { id: 'experience', title: '활동 경험을 입력해 주세요.' },
    UXUX_PORTFOLIO_QUESTION,
    UXUX_INTERVIEW_TIME_QUESTION,
  ],
} satisfies Record<(typeof UXUX_POSITION_NAMES)[number], PostingQuestion[]>

function getUxuxPositions(
  appliedNames: readonly string[] = [],
  appliedAt: string | null = null,
): PostingPosition[] {
  return UXUX_POSITION_NAMES.map((name) => ({
    id: name,
    name,
    appliedAt: appliedNames.includes(name) ? appliedAt : null,
    questions: UXUX_QUESTIONS_BY_POSITION[name],
  }))
}

function createUxuxDetail(
  id: string,
  today: string,
  endDate: string,
  overrides: Partial<PostingDetail> = {},
): PostingDetail {
  const schedule = getUxuxSchedule(endDate)

  return {
    id,
    title: 'UXUX 14기 신입 부원 모집',
    organization: createUxuxOrganization(today),
    eligibility: '대학생 · 휴학생 (1~3학년, 졸업 예정자 가능)',
    activityArea: '신촌 · 온라인 병행',
    membershipFee: '학기당 30,000원',
    ...schedule,
    coverImage: null,
    content: UXUX_CONTENT,
    questions: [],
    application: { type: 'byPosition', positions: getUxuxPositions() },
    requiresProfilePhoto: false,
    ...overrides,
  }
}

function createSwCouncilDetail(
  id: string,
  endDate: string,
  application: PostingApplication = { type: 'direct', appliedAt: null },
): PostingDetail {
  return {
    id,
    title: '집행부원 추가 모집',
    organization: SW_COUNCIL_ORGANIZATION,
    interview: null,
    eligibility: '소프트웨어학과 재학생 · 휴학생',
    activityArea: '학생회실',
    membershipFee: null,
    recruitmentStartsAt: toSeoulDateTime(addDaysToIsoDate(endDate, -14), '00:00:00'),
    recruitmentEndsAt: toSeoulDateTime(endDate, '23:59:59'),
    documentResultDate: null,
    finalResultDate: addDaysToIsoDate(endDate, 3),
    coverImage: null,
    content: SW_COUNCIL_CONTENT,
    questions: [
      {
        id: 'motivation',
        title: '집행부에 지원한 동기를 작성해 주세요.',
      },
      {
        id: 'experience',
        title: '행사를 기획하거나 운영한 경험이 있다면 알려 주세요.',
      },
    ],
    application,
    requiresProfilePhoto: false,
  }
}

// today는 한국 날짜(YYYY-MM-DD)
function getPostingDetailSample(postingId: string, today: string): PostingDetail | undefined {
  const openEndDate = addDaysToIsoDate(today, 1)
  const appliedAt = addDaysToIsoDate(today, -12)
  const ID = POSTING_DETAIL_SAMPLE_ID

  switch (postingId) {
    case ID.open:
      return createUxuxDetail(postingId, today, openEndDate)
    case ID.upcoming:
      return createUxuxDetail(postingId, today, addDaysToIsoDate(today, 17))
    case ID.closed:
      return createUxuxDetail(postingId, today, addDaysToIsoDate(today, -1))
    case ID.partiallyApplied:
      return createUxuxDetail(postingId, today, openEndDate, {
        application: { type: 'byPosition', positions: getUxuxPositions(['디자인'], appliedAt) },
      })
    case ID.fullyApplied:
      return createUxuxDetail(postingId, today, openEndDate, {
        application: {
          type: 'byPosition',
          positions: getUxuxPositions(UXUX_POSITION_NAMES, appliedAt),
        },
      })
    case ID.missingInfo:
      return createUxuxDetail(postingId, today, openEndDate, {
        activityArea: null,
        membershipFee: null,
        finalResultDate: null,
      })
    case ID.photoRequired:
      return createUxuxDetail(postingId, today, openEndDate, { requiresProfilePhoto: true })
    case ID.supporters:
      return createUxuxDetail(
        postingId,
        today,
        addDaysToIsoDate(today, UXUX_SUPPORTERS_DAYS_LEFT),
        {
          title: '홍보 서포터즈 모집',
          interview: null,
          eligibility: '대학생 · 휴학생',
          activityArea: '신촌',
          membershipFee: null,
          documentResultDate: null,
          questions: [
            {
              id: 'motivation',
              title: '홍보 서포터즈에 지원한 동기를 작성해 주세요.',
            },
          ],
          application: { type: 'direct', appliedAt: null },
        },
      )
    case ID.direct:
      return createSwCouncilDetail(postingId, addDaysToIsoDate(today, 3))
    case ID.directApplied:
      return createSwCouncilDetail(postingId, addDaysToIsoDate(today, 3), {
        type: 'direct',
        appliedAt,
      })
    // Figma에 없는 조합, 포지션 없는 모집의 모집 예정·마감 배지·버튼 확인용
    case ID.directUpcoming:
      return createSwCouncilDetail(postingId, addDaysToIsoDate(today, 17))
    case ID.directClosed:
      return createSwCouncilDetail(postingId, addDaysToIsoDate(today, -1))
    default:
      return undefined
  }
}

export { getPostingDetailSample, POSTING_DETAIL_SAMPLE_ID }

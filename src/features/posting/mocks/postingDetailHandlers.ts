import { delay, HttpResponse } from 'msw'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import type { PostingQuery, PostingQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_LOGO_URL, MOCK_ORGANIZATION_NAME } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import { fetchServerPostingDetail, toServerErrorBody } from './demoServerPostings'
import {
  findOrganizationPostingSample,
  type OrganizationPostingSample,
} from './organizationPostingSamples'

type PostingResponse = PostingQuery['posting']

// 오늘 기준 남은 날
type RecruitmentOffset = {
  startInDays?: number
  endInDays: number
}

// 전체 공고 카드·지원서 작성 샘플과 같은 id
const POSTING_SAMPLE_ID = {
  open: 'uxux-14',
  upcoming: 'uxux-14-upcoming',
  closed: 'uxux-14-closed',
  partiallyApplied: 'uxux-14-partially-applied',
  fullyApplied: 'uxux-14-fully-applied',
  missingInfo: 'uxux-14-missing-info',
  photoRequired: 'uxux-14-photo-required',
  supporters: 'uxux-supporters',
  direct: 'sw-council-staff',
  directApplied: 'sw-council-staff-applied',
  directUpcoming: 'sw-council-staff-upcoming',
  directClosed: 'sw-council-staff-closed',
} as const

const ID = POSTING_SAMPLE_ID

const RECRUITMENT_PERIOD_DAYS = 14

// 전체 공고 카드와 같은 마감일
const RECRUITMENT_OFFSET = {
  open: { endInDays: 1 },
  partiallyApplied: { endInDays: 2 },
  direct: { endInDays: 3 },
  fullyApplied: { endInDays: 5 },
  missingInfo: { endInDays: 9 },
  photoRequired: { endInDays: 10 },
  supporters: { endInDays: 12 },
  directApplied: { endInDays: 14 },
  upcoming: { startInDays: 3, endInDays: 17 },
  closed: { endInDays: -1 },
} satisfies Record<string, RecruitmentOffset>

const UXUX_CONTENT_HTML = [
  '<h2>UXUX는 이런 동아리예요</h2>',
  '<p>성균관대 UI/UX 디자인 동아리예요. 매 학기 실제 서비스를 함께 기획하고 디자인하며, 디자이너 · 개발자 · 기획자가 한 팀으로 프로젝트를 진행해요.</p>',
  '<h2>이런 활동을 해요</h2>',
  '<ul>',
  '<li><p><strong>정기 세션</strong> 매주 목요일 19:00, 신촌 · 온라인 병행</p></li>',
  '<li><p><strong>팀 프로젝트</strong> 디자이너 · 개발자 · 기획자가 한 팀</p></li>',
  '<li><p><strong>데모데이</strong> 학기 말 프로젝트 결과 공유</p></li>',
  '</ul>',
  '<h2>이런 분을 찾아요</h2>',
  '<ul>',
  '<li><p>사용자 입장에서 문제를 고민하는 걸 <em>좋아하는</em> 분</p></li>',
  '<li><p>매주 목요일 정기 세션에 참여할 수 있는 분</p></li>',
  '<li><p>한 학기 동안 팀 프로젝트를 끝까지 함께할 분</p></li>',
  '</ul>',
].join('')

const SW_COUNCIL_CONTENT_HTML = [
  '<h2>소프트웨어학과 학생회는 이런 일을 해요</h2>',
  '<p>학과 행사를 기획 · 운영하고 학우들의 의견을 학과에 전달해요.<br>이번 학기 함께할 집행부원을 추가로 모집해요.</p>',
  '<h2>이런 활동을 해요</h2>',
  '<ul>',
  '<li><p><strong>정기 회의</strong> 매주 화요일 18:00, 학생회실</p></li>',
  '<li><p><strong>학과 행사</strong> 학기 중 행사 2회 운영</p></li>',
  '</ul>',
].join('')

const UXUX_ORGANIZATION = {
  name: MOCK_ORGANIZATION_NAME,
  type: 'CLUB',
  logoUrl: MOCK_ORGANIZATION_LOGO_URL,
  tagline: '성균관대 UI/UX 디자인 동아리 14기 모집',
  keywords: ['UX', '디자인', '피그마', '프로토타이핑'],
  fields: ['IT_DEV', 'DESIGN_MEDIA'],
  links: [
    { id: 'uxux-instagram', url: 'https://www.instagram.com/uxux_official' },
    { id: 'uxux-notion', url: 'https://uxux.notion.site' },
  ],
} satisfies PostingResponse['organization']

const SW_COUNCIL_ORGANIZATION = {
  name: '소프트웨어학과 학생회',
  type: 'STUDENT_COUNCIL',
  logoUrl: null,
  tagline: '소프트웨어학과 학우들의 의견을 학과에 전달하는 학생회',
  keywords: ['학생회', '학과 행사'],
  fields: [],
  links: [{ id: 'sw-council-site', url: 'https://example.com/sw-council' }],
} satisfies PostingResponse['organization']

const UXUX_POSITIONS = [
  { id: 'design', name: '디자인', sortOrder: 0 },
  { id: 'development', name: '개발', sortOrder: 1 },
  { id: 'planning', name: '기획', sortOrder: 2 },
] satisfies PostingResponse['positions']

const UXUX_QUESTIONS = [
  { id: 'motivation', title: 'UXUX에 지원한 동기를 작성해 주세요.', sortOrder: 0, position: null },
  {
    id: 'conflict',
    title: '팀 프로젝트에서 갈등을 해결한 경험을 알려 주세요.',
    sortOrder: 1,
    position: null,
  },
  {
    id: 'planning-experience',
    title: '활동 경험을 입력해 주세요.',
    sortOrder: 2,
    position: { id: 'planning' },
  },
  {
    id: 'design-portfolio',
    title: '포트폴리오 링크 또는 파일',
    sortOrder: 3,
    position: { id: 'design' },
  },
  {
    id: 'planning-portfolio',
    title: '포트폴리오 링크 또는 파일',
    sortOrder: 3,
    position: { id: 'planning' },
  },
] satisfies PostingResponse['questions']

function toSeoulDateTime(isoDate: string, time: string) {
  return `${isoDate}T${time}+09:00`
}

function getRecruitmentPeriod(today: string, { startInDays, endInDays }: RecruitmentOffset) {
  const endDate = addDaysToIsoDate(today, endInDays)
  const startDate = addDaysToIsoDate(today, startInDays ?? endInDays - RECRUITMENT_PERIOD_DAYS)

  return {
    endDate,
    recruitStartAt: toSeoulDateTime(startDate, '00:00:00'),
    recruitEndAt: toSeoulDateTime(endDate, '23:59:59'),
  }
}

function getUxuxActivePostings(today: string, currentId: string) {
  return [
    { id: ID.open, title: 'UXUX 14기 신입 부원 모집', offset: RECRUITMENT_OFFSET.open },
    { id: ID.supporters, title: '홍보 서포터즈 모집', offset: RECRUITMENT_OFFSET.supporters },
  ]
    .filter(({ id }) => id !== currentId)
    .map(({ id, title, offset }) => {
      const { recruitStartAt, recruitEndAt } = getRecruitmentPeriod(today, offset)
      return { id, title, recruitStartAt, recruitEndAt }
    })
}

function createUxuxPosting(
  id: string,
  today: string,
  offset: RecruitmentOffset,
  overrides: Partial<PostingResponse> = {},
): PostingResponse {
  const { endDate, recruitStartAt, recruitEndAt } = getRecruitmentPeriod(today, offset)

  return {
    id,
    title: 'UXUX 14기 신입 부원 모집',
    content: UXUX_CONTENT_HTML,
    noPosition: false,
    hasInterview: true,
    allowEnrolled: true,
    allowOnLeave: true,
    eligibilityNote: '1~3학년, 졸업 예정자 가능',
    region: '신촌 · 온라인 병행',
    fee: '학기당 30,000원',
    recruitStartAt,
    recruitEndAt,
    docResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 3), '18:00:00'),
    finalResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 12), '18:00:00'),
    images: [
      {
        url: `https://picsum.photos/seed/${id}/1560/780`,
        isRepresentative: true,
        sortOrder: 0,
      },
    ],
    positions: UXUX_POSITIONS,
    questions: UXUX_QUESTIONS,
    interviewTimeRanges: [6, 7, 8].map((days) => ({ date: addDaysToIsoDate(endDate, days) })),
    organization: UXUX_ORGANIZATION,
    otherActivePostings: getUxuxActivePostings(today, id),
    ...overrides,
  }
}

function createSwCouncilPosting(
  id: string,
  today: string,
  offset: RecruitmentOffset,
): PostingResponse {
  const { endDate, recruitStartAt, recruitEndAt } = getRecruitmentPeriod(today, offset)

  return {
    id,
    title: '집행부원 추가 모집',
    content: SW_COUNCIL_CONTENT_HTML,
    noPosition: true,
    hasInterview: false,
    allowEnrolled: true,
    allowOnLeave: true,
    eligibilityNote: '소프트웨어학과',
    region: '학생회실',
    fee: null,
    recruitStartAt,
    recruitEndAt,
    docResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 3), '18:00:00'),
    finalResultAt: null,
    images: [],
    positions: [],
    questions: [
      {
        id: 'motivation',
        title: '집행부에 지원한 동기를 작성해 주세요.',
        sortOrder: 0,
        position: null,
      },
      {
        id: 'experience',
        title: '행사를 기획하거나 운영한 경험이 있다면 알려 주세요.',
        sortOrder: 1,
        position: null,
      },
    ],
    interviewTimeRanges: [],
    organization: SW_COUNCIL_ORGANIZATION,
    otherActivePostings: [],
  }
}

// 지원 여부는 상세에 안 보여 같은 응답
// 작성 중 공고는 공개 전이라 상세 없음
function createOrganizationPosting(
  { id, title, hasInterview, noPosition, endInDays }: OrganizationPostingSample,
  today: string,
): PostingResponse | undefined {
  if (endInDays === null) {
    return undefined
  }

  return createUxuxPosting(
    id,
    today,
    { endInDays },
    {
      title,
      hasInterview,
      noPosition,
      positions: noPosition ? [] : UXUX_POSITIONS,
      questions: noPosition
        ? UXUX_QUESTIONS.filter(({ position }) => position === null)
        : UXUX_QUESTIONS,
      ...(hasInterview ? {} : { interviewTimeRanges: [] }),
    },
  )
}

function createPostingSample(postingId: string, today: string): PostingResponse | undefined {
  const organizationSample = findOrganizationPostingSample(postingId)

  if (organizationSample) {
    return createOrganizationPosting(organizationSample, today)
  }

  switch (postingId) {
    case ID.open:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.open)
    case ID.partiallyApplied:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.partiallyApplied)
    case ID.fullyApplied:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.fullyApplied)
    case ID.photoRequired:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.photoRequired)
    case ID.upcoming:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.upcoming)
    case ID.closed:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.closed)
    // 미입력 항목·이미지 없음 확인용
    case ID.missingInfo:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.missingInfo, {
        eligibilityNote: null,
        region: null,
        fee: null,
        finalResultAt: null,
        images: [],
      })
    case ID.supporters:
      return createUxuxPosting(postingId, today, RECRUITMENT_OFFSET.supporters, {
        title: '홍보 서포터즈 모집',
        noPosition: true,
        hasInterview: false,
        eligibilityNote: null,
        region: '신촌',
        fee: null,
        docResultAt: null,
        finalResultAt: null,
        positions: [],
        questions: [
          {
            id: 'motivation',
            title: '홍보 서포터즈에 지원한 동기를 작성해 주세요.',
            sortOrder: 0,
            position: null,
          },
        ],
        interviewTimeRanges: [],
      })
    case ID.direct:
      return createSwCouncilPosting(postingId, today, RECRUITMENT_OFFSET.direct)
    case ID.directApplied:
      return createSwCouncilPosting(postingId, today, RECRUITMENT_OFFSET.directApplied)
    // 포지션 없는 모집의 예정·마감 확인용
    case ID.directUpcoming:
      return createSwCouncilPosting(postingId, today, RECRUITMENT_OFFSET.upcoming)
    case ID.directClosed:
      return createSwCouncilPosting(postingId, today, RECRUITMENT_OFFSET.closed)
    default:
      return undefined
  }
}

const postingDetailHandlers = [
  graphqlApi.query<PostingQuery, PostingQueryVariables>('Posting', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)
    // ID 입력은 string | number로 생성되어 문자열로 통일
    const postingId = String(variables.id)
    // 시연 모드의 실서버 공고는 실서버 상세 (전시회 후 삭제)
    if (isServerPosting(postingId)) {
      try {
        return HttpResponse.json({ data: { posting: await fetchServerPostingDetail(postingId) } })
      } catch (error) {
        return HttpResponse.json(toServerErrorBody(error))
      }
    }
    const posting = createPostingSample(postingId, getSeoulIsoDate(new Date()))

    if (!posting) {
      return HttpResponse.json({
        errors: [{ message: '공고를 찾을 수 없습니다.', extensions: { code: 'POSTING_404' } }],
        data: null,
      })
    }
    return HttpResponse.json({ data: { posting } })
  }),
]

export { createPostingSample, POSTING_SAMPLE_ID, postingDetailHandlers, UXUX_POSITIONS }

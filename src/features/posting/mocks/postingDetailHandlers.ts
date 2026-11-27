import { delay, HttpResponse } from 'msw'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import type { PostingQuery, PostingQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import { fetchServerPostingDetail, toServerErrorBody } from './demoServerPostings'
import {
  findOrganizationPostingSample,
  MOZIP_POSTING_TITLE,
  ORGANIZATION_POSTING_ID,
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
  open: 'mozip-team',
  direct: 'sw-council-staff',
  directApplied: 'sw-council-staff-applied',
  directUpcoming: 'sw-council-staff-upcoming',
  directClosed: 'sw-council-staff-closed',
} as const

const ID = POSTING_SAMPLE_ID

// 외부 이미지 요청 없이 보이도록 앱의 OG 이미지(1200×630) 사용
const SAMPLE_POSTING_IMAGE_URL = '/opengraph-image.png'

const RECRUITMENT_PERIOD_DAYS = 14

// 전체 공고 카드와 같은 마감일
const RECRUITMENT_OFFSET = {
  open: { endInDays: 1 },
  direct: { endInDays: 3 },
  directApplied: { endInDays: 14 },
  upcoming: { startInDays: 3, endInDays: 17 },
  closed: { endInDays: -1 },
} satisfies Record<string, RecruitmentOffset>

const MOZIP_CONTENT_HTML = [
  '<h2>MOZIP.은 이런 팀이에요</h2>',
  '<p>동아리 · 학회 · 학생회의 공고 탐색부터 지원, 서류 · 면접 평가, 최종 선발까지 한 곳에서 이어지는 통합 모집 플랫폼을 만들고 있어요. 흩어진 모집 과정을 하나로 모으는 일을 함께할 팀원을 찾아요.</p>',
  '<h2>이런 일을 함께해요</h2>',
  '<ul>',
  '<li><p><strong>기획</strong> 지원자와 운영진의 모집 흐름을 정리하고 기능 우선순위를 정해요</p></li>',
  '<li><p><strong>디자인</strong> 공고 탐색부터 평가까지 이어지는 화면과 디자인 시스템을 만들어요</p></li>',
  '<li><p><strong>개발</strong> 공고 · 지원서 · 평가 · 면접 일정 기능을 구현해요</p></li>',
  '</ul>',
  '<h2>이런 분을 찾아요</h2>',
  '<ul>',
  '<li><p>동아리 · 학회 모집을 준비하거나 지원하면서 <em>불편했던 경험</em>이 있는 분</p></li>',
  '<li><p>기획 · 디자인 · 개발이 한 팀으로 일하는 방식을 좋아하는 분</p></li>',
  '<li><p>만든 서비스를 실제 사용자에게 선보일 때까지 함께할 분</p></li>',
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

const MOZIP_ORGANIZATION = {
  name: 'MOZIP.',
  type: 'CLUB',
  logoUrl: null,
  tagline: '지원부터 선발까지, 흩어진 모집 과정을 하나로',
  keywords: ['모집 플랫폼', '서비스 기획', '프로덕트 디자인', '웹 개발'],
  fields: ['IT_DEV', 'STARTUP_BUSINESS'],
  links: [],
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

const MOZIP_POSITIONS = [
  { id: 'design', name: '디자인', sortOrder: 0 },
  { id: 'development', name: '개발', sortOrder: 1 },
  { id: 'planning', name: '기획', sortOrder: 2 },
] satisfies PostingResponse['positions']

const MOZIP_QUESTIONS = [
  {
    id: 'motivation',
    title: 'MOZIP. 팀에 지원한 동기를 작성해 주세요.',
    sortOrder: 0,
    position: null,
  },
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

// 면접·포지션 없는 서류 결과 안내 시연 공고, 확인 안 된 자격·지역·회비는 비움
const KUSITMS_POSTING_OVERRIDES = {
  content: [
    '<h2>큐시즘은 이런 학회예요</h2>',
    '<p>한국대학생IT경영학회 큐시즘은 IT와 경영에 관심 있는 대학생이 모여 함께 배우고, 팀을 이뤄 서비스를 기획하고 만들어 보는 학회예요.</p>',
    '<h2>이런 분을 찾아요</h2>',
    '<ul>',
    '<li><p>IT 서비스를 직접 기획하고 만들어 보고 싶은 분</p></li>',
    '<li><p>기획 · 디자인 · 개발이 한 팀으로 일하는 경험을 해 보고 싶은 분</p></li>',
    '<li><p>한 기수 동안 책임감 있게 활동할 분</p></li>',
    '</ul>',
  ].join(''),
  eligibilityNote: null,
  region: null,
  fee: null,
  images: [],
  questions: MOZIP_QUESTIONS.filter(({ position }) => position === null).map((question) =>
    question.id === 'motivation'
      ? { ...question, title: '큐시즘에 지원한 동기를 작성해 주세요.' }
      : question,
  ),
  organization: {
    name: '한국대학생IT경영학회 큐시즘',
    type: 'ACADEMIC',
    logoUrl: null,
    tagline: 'IT와 경영을 함께 배우는 대학생 학회',
    keywords: ['IT', '경영', '서비스 기획', '팀 프로젝트'],
    fields: ['ACADEMIC_STUDY', 'IT_DEV'],
    links: [],
  },
  otherActivePostings: [],
} satisfies Partial<PostingResponse>

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

// 전체 공고와 운영진 서류 평가 시연 공고가 같이 쓰는 MOZIP. 팀 모집 내용
function createMozipPosting(
  id: string,
  today: string,
  offset: RecruitmentOffset,
  overrides: Partial<PostingResponse> = {},
): PostingResponse {
  const { endDate, recruitStartAt, recruitEndAt } = getRecruitmentPeriod(today, offset)

  return {
    id,
    title: MOZIP_POSTING_TITLE,
    content: MOZIP_CONTENT_HTML,
    noPosition: false,
    hasInterview: true,
    allowEnrolled: true,
    allowOnLeave: true,
    eligibilityNote: '학년 · 전공 무관',
    region: '서울 · 온라인 병행',
    fee: '없음',
    recruitStartAt,
    recruitEndAt,
    docResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 3), '18:00:00'),
    finalResultAt: toSeoulDateTime(addDaysToIsoDate(endDate, 12), '18:00:00'),
    images: [
      {
        url: SAMPLE_POSTING_IMAGE_URL,
        isRepresentative: true,
        sortOrder: 0,
      },
    ],
    positions: MOZIP_POSITIONS,
    questions: MOZIP_QUESTIONS,
    interviewTimeRanges: [6, 7, 8].map((days) => ({ date: addDaysToIsoDate(endDate, days) })),
    organization: MOZIP_ORGANIZATION,
    otherActivePostings: [],
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

  return createMozipPosting(
    id,
    today,
    { endInDays },
    {
      title,
      hasInterview,
      noPosition,
      positions: noPosition ? [] : MOZIP_POSITIONS,
      questions: noPosition
        ? MOZIP_QUESTIONS.filter(({ position }) => position === null)
        : MOZIP_QUESTIONS,
      ...(hasInterview ? {} : { interviewTimeRanges: [] }),
      ...(id === ORGANIZATION_POSTING_ID.noInterviewResult ? KUSITMS_POSTING_OVERRIDES : {}),
    },
  )
}

function createPostingSample(postingId: string, today: string): PostingResponse | undefined {
  const organizationSample = findOrganizationPostingSample(postingId)

  if (organizationSample) {
    return createOrganizationPosting(organizationSample, today)
  }

  switch (postingId) {
    // 전체 공고에 보이는 시연용 공고
    case ID.open:
      return createMozipPosting(postingId, today, RECRUITMENT_OFFSET.open)
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

export {
  createPostingSample,
  POSTING_SAMPLE_ID,
  postingDetailHandlers,
  SAMPLE_POSTING_IMAGE_URL,
  MOZIP_POSITIONS,
}

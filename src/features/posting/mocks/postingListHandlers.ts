import { delay, HttpResponse } from 'msw'
import { isPostingDemoMode } from '@/features/posting/utils/demoServerPosting'
import type {
  OrganizationField,
  PostingFilter,
  PostingsQuery,
  PostingsQueryVariables,
} from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import {
  EMPTY_POSTING_PAGE,
  fetchServerPostingPage,
  mergeServerPostingPage,
} from './demoServerPostings'
import { MOZIP_POSTING_TITLE } from './organizationPostingSamples'
import {
  POSTING_SAMPLE_ID,
  SAMPLE_POSTING_IMAGE_URL,
  MOZIP_POSITIONS,
} from './postingDetailHandlers'

type PostingCard = PostingsQuery['postings']['items'][number]

type PostingCardSample = Omit<PostingCard, 'recruitEndAt' | 'thumbnailUrl'> & {
  // D-day 확인용으로 오늘 기준 마감일
  daysUntilEnd: number
  // 응답에는 없고 활동 분야 필터 확인용
  fields: OrganizationField[]
  // 응답에는 없고 공고 범위 필터 확인용, null이면 연합
  schoolId: string | null
}

// 명세 기본값
const DEFAULT_PAGE = 0
const DEFAULT_PAGE_SIZE = 20

const ID = POSTING_SAMPLE_ID

// 카드를 누르면 상세 목데이터로 이동하도록 id 맞춤
const POSTING_CARD_SAMPLES = [
  {
    id: ID.open,
    title: MOZIP_POSTING_TITLE,
    organization: { name: 'MOZIP.', type: 'CLUB' },
    daysUntilEnd: 1,
    fields: ['IT_DEV', 'STARTUP_BUSINESS'],
    schoolId: null,
    positions: MOZIP_POSITIONS,
  },
] satisfies PostingCardSample[]

function matchesFilter(sample: PostingCardSample, filter: PostingFilter | null | undefined) {
  const keyword = filter?.keyword?.trim().toLowerCase()
  const fields = filter?.fields ?? []
  const matchesKeyword =
    !keyword ||
    [sample.title, sample.organization.name].some((text) => text.toLowerCase().includes(keyword))
  const organizationTypes = filter?.organizationTypes ?? []
  const matchesFields = fields.length === 0 || sample.fields.some((field) => fields.includes(field))
  const matchesType =
    organizationTypes.length === 0 || organizationTypes.includes(sample.organization.type)
  // 안 보내면 전체, null이면 연합만, 값이 있으면 그 학교만
  const matchesSchool = filter?.schoolId === undefined || sample.schoolId === filter.schoolId

  return matchesKeyword && matchesType && matchesFields && matchesSchool
}

function createPostingCards(variables: PostingsQueryVariables, now: Date): PostingCard[] {
  const today = getSeoulIsoDate(now)
  const samples = POSTING_CARD_SAMPLES.filter((sample) => matchesFilter(sample, variables.filter))
  const sortedSamples =
    variables.sort === 'CLOSING_SOON'
      ? samples.toSorted((a, b) => a.daysUntilEnd - b.daysUntilEnd)
      : samples

  return sortedSamples.map(({ daysUntilEnd, fields: _fields, schoolId: _schoolId, ...card }) => ({
    ...card,
    thumbnailUrl: SAMPLE_POSTING_IMAGE_URL,
    recruitEndAt: `${addDaysToIsoDate(today, daysUntilEnd)}T23:59:59+09:00`,
  }))
}

const postingListHandlers = [
  graphqlApi.query<PostingsQuery, PostingsQueryVariables>('Postings', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)

    const page = variables.page ?? DEFAULT_PAGE
    const size = variables.size ?? DEFAULT_PAGE_SIZE
    const cards = createPostingCards(variables, new Date())
    // 시연 모드는 게시한 실서버 공고를 샘플 앞에 둠 (전시회 후 삭제)
    const serverPage = isPostingDemoMode()
      ? await fetchServerPostingPage({ ...variables, page, size })
      : EMPTY_POSTING_PAGE

    return HttpResponse.json({
      data: { postings: mergeServerPostingPage(serverPage, cards, page, size) },
    })
  }),
]

export { postingListHandlers }

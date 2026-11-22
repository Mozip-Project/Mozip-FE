import { delay, HttpResponse } from 'msw'
import type { PostingsQuery, PostingsQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'
import { addDaysToIsoDate, getSeoulIsoDate } from '@/utils/date'
import { POSTING_DETAIL_SAMPLE_ID } from './postingDetailSample'

type PostingCard = PostingsQuery['postings']['items'][number]

type PostingCardSample = Omit<PostingCard, 'recruitEndAt' | 'thumbnailUrl'> & {
  // D-day 확인용으로 오늘 기준 마감일
  daysUntilEnd: number
}

// 명세 기본값
const DEFAULT_PAGE = 0
const DEFAULT_PAGE_SIZE = 20

const ID = POSTING_DETAIL_SAMPLE_ID

// 카드를 누르면 상세 목데이터로 이동하도록 id만 맞춤, UXUX·학생회 외 카드는 상세 내용과 다름
const POSTING_CARD_SAMPLES = [
  {
    id: ID.open,
    title: 'UI/UX 디자인 동아리 14기 모집',
    organization: { name: 'UXUX', type: 'CLUB' },
    daysUntilEnd: 1,
    positions: [
      { id: 'open-1', name: '기획', sortOrder: 0 },
      { id: 'open-2', name: '개발', sortOrder: 1 },
      { id: 'open-3', name: '디자인', sortOrder: 2 },
    ],
  },
  {
    id: ID.partiallyApplied,
    title: '2026-2 신입 학회원 모집',
    organization: { name: '경영전략학회', type: 'ACADEMIC' },
    daysUntilEnd: 2,
    positions: [
      { id: 'partiallyApplied-1', name: '리서치', sortOrder: 0 },
      { id: 'partiallyApplied-2', name: '전략', sortOrder: 1 },
    ],
  },
  {
    id: ID.direct,
    title: '집행부원 추가 모집',
    organization: { name: '소프트웨어학과 학생회', type: 'STUDENT_COUNCIL' },
    daysUntilEnd: 3,
    positions: [],
  },
  {
    id: ID.fullyApplied,
    title: '보컬 · 기타 신입 모집',
    organization: { name: '밴드 소리샘', type: 'CLUB' },
    daysUntilEnd: 5,
    positions: [
      { id: 'fullyApplied-1', name: '보컬', sortOrder: 0 },
      { id: 'fullyApplied-2', name: '기타', sortOrder: 1 },
      { id: 'fullyApplied-3', name: '드럼', sortOrder: 2 },
    ],
  },
  {
    id: ID.upcoming,
    title: '12기 학회원 모집',
    organization: { name: '데이터분석학회 DAS', type: 'ACADEMIC' },
    daysUntilEnd: 7,
    positions: [
      { id: 'upcoming-1', name: '분석', sortOrder: 0 },
      { id: 'upcoming-2', name: '엔지니어링', sortOrder: 1 },
    ],
  },
  {
    id: ID.missingInfo,
    title: '백엔드 · 프론트 신입 모집',
    organization: { name: '멋쟁이개발자', type: 'CLUB' },
    daysUntilEnd: 9,
    positions: [
      { id: 'missingInfo-1', name: '백엔드', sortOrder: 0 },
      { id: 'missingInfo-2', name: '프론트엔드', sortOrder: 1 },
    ],
  },
  {
    id: ID.photoRequired,
    title: '사진 동아리 신입 부원 모집',
    organization: { name: '빛그림', type: 'CLUB' },
    daysUntilEnd: 10,
    positions: [],
  },
  {
    id: ID.supporters,
    title: '홍보 서포터즈 모집',
    organization: { name: 'UXUX', type: 'CLUB' },
    daysUntilEnd: 12,
    positions: [
      { id: 'supporters-1', name: '콘텐츠', sortOrder: 0 },
      { id: 'supporters-2', name: 'SNS', sortOrder: 1 },
    ],
  },
  {
    id: ID.directApplied,
    title: '신입 국원 모집',
    organization: { name: '총학생회', type: 'STUDENT_COUNCIL' },
    daysUntilEnd: 14,
    positions: [],
  },
  {
    id: ID.directUpcoming,
    title: '영어 회화 스터디원 모집',
    organization: { name: '글로벌토크', type: 'CLUB' },
    daysUntilEnd: 0,
    positions: [
      { id: 'directUpcoming-1', name: '회화', sortOrder: 0 },
      { id: 'directUpcoming-2', name: '튜터', sortOrder: 1 },
    ],
  },
] satisfies PostingCardSample[]

function createPostingCards(now: Date): PostingCard[] {
  const today = getSeoulIsoDate(now)

  return POSTING_CARD_SAMPLES.map(({ daysUntilEnd, ...card }) => ({
    ...card,
    // 카드 id를 seed로 써서 카드마다 다른 사진이 매번 같게 나옴, 썸네일 비율 2:1
    thumbnailUrl: `https://picsum.photos/seed/${card.id}/640/320`,
    recruitEndAt: `${addDaysToIsoDate(today, daysUntilEnd)}T23:59:59+09:00`,
  }))
}

const postingListHandlers = [
  graphqlApi.query<PostingsQuery, PostingsQueryVariables>('Postings', async ({ variables }) => {
    await delay(MOCK_RESPONSE_DELAY_MS)

    const page = variables.page ?? DEFAULT_PAGE
    const size = variables.size ?? DEFAULT_PAGE_SIZE
    const cards = createPostingCards(new Date())

    return HttpResponse.json({
      data: {
        postings: {
          totalCount: cards.length,
          items: cards.slice(page * size, (page + 1) * size),
        },
      },
    })
  }),
]

export { postingListHandlers }

import type { PostingListItem } from '@/features/posting/components/postingList/postingListContent'
import { getPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import { POSTING_DETAIL_SAMPLE_ID } from './postingDetailSample'

// Figma 전체 공고 3x3 그리드 기준
const POSTING_LIST_PAGE_SIZE = 9
const SAMPLE_TOTAL_COUNT = 128
const SAMPLE_TAGS = ['면접 있음', '회비 3만원/학기', '신촌']

// UXUX·학생회 외 카드는 상세 케이스 확인용 연결이라 카드와 상세 내용이 다름
const SAMPLE_POSTINGS = [
  {
    title: 'UI/UX 디자인 동아리 14기 모집',
    type: '동아리',
    name: 'UXUX',
    deadline: '모집 D-1',
    detailId: POSTING_DETAIL_SAMPLE_ID.open,
  },
  {
    title: '2026-2 신입 학회원 모집',
    type: '학회',
    name: '경영전략학회',
    deadline: '모집중 D-2',
    detailId: POSTING_DETAIL_SAMPLE_ID.partiallyApplied,
  },
  {
    title: '집행부원 추가 모집',
    type: '학생회',
    name: '소프트웨어학과 학생회',
    deadline: '모집중 D-3',
    detailId: POSTING_DETAIL_SAMPLE_ID.direct,
  },
  {
    title: '보컬 · 기타 신입 모집',
    type: '동아리',
    name: '밴드 소리샘',
    deadline: '모집중 D-5',
    detailId: POSTING_DETAIL_SAMPLE_ID.fullyApplied,
  },
  {
    title: '12기 학회원 모집',
    type: '학회',
    name: '데이터분석학회 DAS',
    deadline: '모집중 D-7',
    detailId: POSTING_DETAIL_SAMPLE_ID.upcoming,
  },
  {
    title: '백엔드 · 프론트 신입 모집',
    type: '동아리',
    name: '멋쟁이개발자',
    deadline: '모집중 D-9',
    detailId: POSTING_DETAIL_SAMPLE_ID.missingInfo,
  },
].map((posting, index): PostingListItem => ({
  id: `sample-${index}`,
  href: getPostingDetailPath(posting.detailId),
  title: posting.title,
  organizationType: posting.type,
  organizationName: posting.name,
  deadlineLabel: posting.deadline,
  tags: SAMPLE_TAGS,
}))

// 페이지마다 같은 카드를 채워 그리드 배치만 확인
function getPostingListSample(page: number) {
  const postings = [...SAMPLE_POSTINGS, ...SAMPLE_POSTINGS]
    .slice(0, POSTING_LIST_PAGE_SIZE)
    .map((posting, index) => ({ ...posting, id: `${page}-${index}` }))

  return {
    totalCount: SAMPLE_TOTAL_COUNT,
    totalPages: Math.ceil(SAMPLE_TOTAL_COUNT / POSTING_LIST_PAGE_SIZE),
    postings,
  }
}

export { getPostingListSample }

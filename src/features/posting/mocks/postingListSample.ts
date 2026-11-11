import type { PostingListItem } from '@/features/posting/components/postingList/postingListContent'

// Figma 전체 공고 3x3 그리드 기준
const POSTING_LIST_PAGE_SIZE = 9
const SAMPLE_TOTAL_COUNT = 128
const SAMPLE_TAGS = ['면접 있음', '회비 3만원/학기', '신촌']

// TODO: 공고 상세 경로가 생기면 href 교체
const SAMPLE_POSTINGS = [
  { title: 'UI/UX 디자인 동아리 14기 모집', type: '동아리', name: 'UXUX', deadline: '모집 D-1' },
  { title: '2026-2 신입 학회원 모집', type: '학회', name: '경영전략학회', deadline: '모집중 D-2' },
  {
    title: '집행부원 추가 모집',
    type: '학생회',
    name: '소프트웨어학과 학생회',
    deadline: '모집중 D-3',
  },
  { title: '보컬 · 기타 신입 모집', type: '동아리', name: '밴드 소리샘', deadline: '모집중 D-5' },
  { title: '12기 학회원 모집', type: '학회', name: '데이터분석학회 DAS', deadline: '모집중 D-7' },
  {
    title: '백엔드 · 프론트 신입 모집',
    type: '동아리',
    name: '멋쟁이개발자',
    deadline: '모집중 D-9',
  },
].map((posting, index): PostingListItem => ({
  id: `sample-${index}`,
  href: '/postings',
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

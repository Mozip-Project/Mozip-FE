import type { PostingStatus } from '@/gql/graphql'

// 운영진 홈·공고 관리 상세·지원자 관리 MSW가 같이 쓰는 단체 1(UXUX) 공고, 전체 공고 목록에는 없음
const ORGANIZATION_POSTING_ID = {
  docReview: 'uxux-14-doc-review',
  noInterviewResult: 'uxux-14-no-interview-result',
} as const

type OrganizationPostingSample = {
  id: string
  title: string
  status: PostingStatus
  hasInterview: boolean
  noPosition: boolean
  // 오늘 기준 모집 마감까지 남은 날, 작성 중은 일정 입력 전이라 null
  endInDays: number | null
  // 최신순 순위, 진행 중 공고만 존재
  bumpRank: number | null
  applicantCount: number
}

const ID = ORGANIZATION_POSTING_ID

// 전체 공고의 시연용 공고와 같은 제목
const MOZIP_POSTING_TITLE = 'MOZIP. 함께 만들 팀원 모집'

const ORGANIZATION_POSTING_SAMPLES = [
  {
    id: ID.docReview,
    title: MOZIP_POSTING_TITLE,
    status: 'DOC_REVIEW',
    hasInterview: true,
    noPosition: false,
    endInDays: -2,
    bumpRank: 24,
    applicantCount: 48,
  },
  // 면접·파트 없는 모집의 결과 확정
  {
    id: ID.noInterviewResult,
    title: '한국대학생IT경영학회 큐시즘 34기 학회원 모집',
    status: 'DOC_RESULT_NOTICE',
    hasInterview: false,
    noPosition: true,
    endInDays: -5,
    bumpRank: 40,
    applicantCount: 18,
  },
] satisfies OrganizationPostingSample[]

function findOrganizationPostingSample(postingId: string): OrganizationPostingSample | undefined {
  return ORGANIZATION_POSTING_SAMPLES.find(({ id }) => id === postingId)
}

// 서류 결과를 확정한 뒤의 단계인지, 상태 추가 시 누락을 타입 오류로 확인
function isDocumentResultConfirmed(status: PostingStatus): boolean {
  switch (status) {
    case 'DRAFT':
    case 'RECRUITING':
    case 'DOC_REVIEW':
      return false
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return true
    default: {
      const unhandledStatus: never = status
      return unhandledStatus
    }
  }
}

export {
  findOrganizationPostingSample,
  isDocumentResultConfirmed,
  MOZIP_POSTING_TITLE,
  ORGANIZATION_POSTING_ID,
  ORGANIZATION_POSTING_SAMPLES,
}
export type { OrganizationPostingSample }

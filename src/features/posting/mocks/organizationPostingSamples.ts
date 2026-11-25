import type { PostingStatus } from '@/gql/graphql'

// 운영진 홈·공고 관리 상세·지원자 관리 MSW가 같이 쓰는 단체 1(UXUX) 공고, 전체 공고 목록에는 없음
const ORGANIZATION_POSTING_ID = {
  recruiting: 'uxux-14-staff',
  docReview: 'uxux-14-doc-review',
  interview: 'uxux-14-interview',
  finalResult: 'uxux-14-final-result',
  noInterviewResult: 'uxux-14-no-interview-result',
  draft: '3',
  ended: '4',
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

const ORGANIZATION_POSTING_SAMPLES = [
  {
    id: ID.recruiting,
    title: '서류 모집 중 확인하자...',
    status: 'RECRUITING',
    hasInterview: false,
    noPosition: false,
    endInDays: 7,
    bumpRank: 18,
    applicantCount: 12,
  },
  {
    id: ID.docReview,
    title: '서류 평가 진행 중이래',
    status: 'DOC_REVIEW',
    hasInterview: true,
    noPosition: false,
    endInDays: -2,
    bumpRank: 24,
    applicantCount: 48,
  },
  {
    id: ID.interview,
    title: '면접 진행하고 있는 거래...',
    status: 'INTERVIEW',
    hasInterview: true,
    noPosition: false,
    endInDays: -6,
    bumpRank: 30,
    applicantCount: 30,
  },
  {
    id: ID.finalResult,
    title: '면접 결과까지 확정!!!!',
    status: 'FINAL_RESULT',
    hasInterview: true,
    noPosition: false,
    endInDays: -14,
    bumpRank: 35,
    applicantCount: 24,
  },
  // 면접·파트 없는 모집의 결과 확정
  {
    id: ID.noInterviewResult,
    title: '얘는 면접 없는 거...',
    status: 'DOC_RESULT_NOTICE',
    hasInterview: false,
    noPosition: true,
    endInDays: -5,
    bumpRank: 40,
    applicantCount: 18,
  },
  {
    id: ID.draft,
    title: 'UXUX 15기 운영진 추가 모집',
    status: 'DRAFT',
    hasInterview: false,
    noPosition: false,
    endInDays: null,
    bumpRank: null,
    applicantCount: 0,
  },
  // 공지 발송 불가(MESSAGE_422) 확인용 지원자 0명 공고
  {
    id: ID.ended,
    title: 'UXUX 13기 신입 부원 모집',
    status: 'ENDED',
    hasInterview: false,
    noPosition: false,
    endInDays: -40,
    bumpRank: null,
    applicantCount: 0,
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
  ORGANIZATION_POSTING_ID,
  ORGANIZATION_POSTING_SAMPLES,
}
export type { OrganizationPostingSample }

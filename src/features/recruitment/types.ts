const DOCUMENT_REVIEW_PAGE_SIZE = 10

const DOCUMENT_REVIEW_STATUSES = ['all', 'pending', 'done'] as const
const DOCUMENT_REVIEW_POSITIONS = ['design', 'development', 'planning'] as const
const DOCUMENT_REVIEW_SORTS = ['submittedDesc', 'submittedAsc', 'nameAsc', 'nameDesc'] as const

type DocumentReviewStatus = (typeof DOCUMENT_REVIEW_STATUSES)[number]
type DocumentReviewPosition = (typeof DOCUMENT_REVIEW_POSITIONS)[number]
type DocumentReviewSort = (typeof DOCUMENT_REVIEW_SORTS)[number]

const DOCUMENT_REVIEW_STATUS_LABEL = {
  all: '전체',
  pending: '평가 전',
  done: '평가 완료',
} satisfies Record<DocumentReviewStatus, string>

const DOCUMENT_REVIEW_POSITION_LABEL = {
  design: '디자인',
  development: '개발',
  planning: '기획',
} satisfies Record<DocumentReviewPosition, string>

const DOCUMENT_REVIEW_SORT_LABEL = {
  submittedDesc: '제출일 최신순',
  submittedAsc: '제출일 오래된 순',
  nameAsc: '이름 가나다순',
  nameDesc: '이름 역순',
} satisfies Record<DocumentReviewSort, string>

type DocumentReviewApplicant = {
  id: string
  name: string
  position: DocumentReviewPosition
  submittedAt: string
  isEvaluated: boolean
}

type DocumentReviewQuery = {
  status: DocumentReviewStatus
  positions: readonly DocumentReviewPosition[]
  sort: DocumentReviewSort
  keyword: string
  page: number
}

type DocumentReviewApplicantPage = {
  applicants: DocumentReviewApplicant[]
  statusCounts: Record<DocumentReviewStatus, number>
  positionCounts: Record<DocumentReviewPosition, number>
  currentPage: number
  totalPages: number
}

export {
  DOCUMENT_REVIEW_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITION_LABEL,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
}
export type {
  DocumentReviewApplicant,
  DocumentReviewApplicantPage,
  DocumentReviewPosition,
  DocumentReviewQuery,
  DocumentReviewSort,
  DocumentReviewStatus,
}

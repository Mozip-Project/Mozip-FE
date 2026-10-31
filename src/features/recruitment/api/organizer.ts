import { DOCUMENT_REVIEW_SAMPLE } from './documentReviewSample'

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

function matchesStatus(applicant: DocumentReviewApplicant, status: DocumentReviewStatus) {
  switch (status) {
    case 'all':
      return true
    case 'pending':
      return !applicant.isEvaluated
    case 'done':
      return applicant.isEvaluated
  }
}

function compareApplicants(
  a: DocumentReviewApplicant,
  b: DocumentReviewApplicant,
  sort: DocumentReviewSort,
) {
  switch (sort) {
    case 'submittedDesc':
      return b.submittedAt.localeCompare(a.submittedAt)
    case 'submittedAsc':
      return a.submittedAt.localeCompare(b.submittedAt)
    case 'nameAsc':
      return a.name.localeCompare(b.name, 'ko')
    case 'nameDesc':
      return b.name.localeCompare(a.name, 'ko')
  }
}

function countBy<TKey extends string>(
  keys: readonly TKey[],
  applicants: readonly DocumentReviewApplicant[],
  matches: (applicant: DocumentReviewApplicant, key: TKey) => boolean,
) {
  return Object.fromEntries(
    keys.map((key) => [key, applicants.filter((applicant) => matches(applicant, key)).length]),
  ) as Record<TKey, number>
}

// 마감 시각부터 수정 불가, 읽을 수 없는 값도 수정 불가로 처리
function canEditDocumentReview(deadline: string, now: Date) {
  const deadlineTime = Date.parse(deadline)

  if (Number.isNaN(deadlineTime)) {
    return false
  }

  return now.getTime() < deadlineTime
}

// TODO: 서류 평가 지원자 목록 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getDocumentReviewApplicants(
  _recruitmentId: string,
  query: DocumentReviewQuery,
): Promise<DocumentReviewApplicantPage> {
  const keyword = query.keyword.trim()
  const matchesKeyword = (applicant: DocumentReviewApplicant) => applicant.name.includes(keyword)
  const matchesPositions = (applicant: DocumentReviewApplicant) =>
    query.positions.includes(applicant.position)

  // Figma 공통 규칙: 탭 숫자는 필터·검색 적용 결과 기준
  const filtered = DOCUMENT_REVIEW_SAMPLE.filter(
    (applicant) => matchesKeyword(applicant) && matchesPositions(applicant),
  )
  const statusCounts = countBy(DOCUMENT_REVIEW_STATUSES, filtered, matchesStatus)

  // 포지션 메뉴 숫자는 포지션 선택을 제외한 탭·검색 결과 기준
  const positionCounts = countBy(
    DOCUMENT_REVIEW_POSITIONS,
    DOCUMENT_REVIEW_SAMPLE.filter(
      (applicant) => matchesKeyword(applicant) && matchesStatus(applicant, query.status),
    ),
    (applicant, position) => applicant.position === position,
  )

  const list = filtered
    .filter((applicant) => matchesStatus(applicant, query.status))
    .sort((a, b) => compareApplicants(a, b, query.sort))
  const totalPages = Math.ceil(list.length / DOCUMENT_REVIEW_PAGE_SIZE)
  const currentPage = Math.min(Math.max(query.page, 1), Math.max(totalPages, 1))
  const pageStart = (currentPage - 1) * DOCUMENT_REVIEW_PAGE_SIZE

  return {
    applicants: list.slice(pageStart, pageStart + DOCUMENT_REVIEW_PAGE_SIZE),
    statusCounts,
    positionCounts,
    currentPage,
    totalPages,
  }
}

export {
  DOCUMENT_REVIEW_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITION_LABEL,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
  canEditDocumentReview,
  getDocumentReviewApplicants,
}
export type {
  DocumentReviewApplicant,
  DocumentReviewApplicantPage,
  DocumentReviewPosition,
  DocumentReviewQuery,
  DocumentReviewSort,
  DocumentReviewStatus,
}

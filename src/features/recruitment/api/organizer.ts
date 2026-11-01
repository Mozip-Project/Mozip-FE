import {
  DOCUMENT_REVIEW_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentReviewApplicant,
  type DocumentReviewApplicantPage,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
} from '@/features/recruitment/types'
import { DOCUMENT_REVIEW_SAMPLE } from './documentReviewSample'

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

export { getDocumentReviewApplicants }

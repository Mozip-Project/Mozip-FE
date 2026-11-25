import { DOCUMENT_RESULT_SAMPLE } from '@/features/recruitment/mocks/documentResultSample'
import {
  DOCUMENT_RESULT_PAGE_SIZE,
  DOCUMENT_RESULT_STATUSES,
  DOCUMENT_RESULTS,
  DOCUMENT_REVIEW_POSITIONS,
  type DocumentResult,
  type DocumentResultApplicant,
  type DocumentResultApplicantPage,
  type DocumentResultOverview,
  type DocumentResultQuery,
  type DocumentResultSort,
  type DocumentResultStatus,
} from '@/features/recruitment/types'

function countBy<TKey extends string, TItem>(
  keys: readonly TKey[],
  applicants: readonly TItem[],
  matches: (applicant: TItem, key: TKey) => boolean,
) {
  return Object.fromEntries(
    keys.map((key) => [key, applicants.filter((applicant) => matches(applicant, key)).length]),
  ) as Record<TKey, number>
}

function paginate<TItem>(list: readonly TItem[], page: number, pageSize: number) {
  const totalPages = Math.ceil(list.length / pageSize)
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))
  const pageStart = (currentPage - 1) * pageSize

  return {
    applicants: list.slice(pageStart, pageStart + pageSize),
    currentPage,
    totalPages,
  }
}

type DocumentResultEntry = Omit<DocumentResultApplicant, 'rank'>

// 결과 변경이 탭·페이지 이동 후에도 유지되도록 공고별로 메모리에 보관, 새로고침 시 초기화
const documentResultStates = new Map<string, DocumentResultEntry[]>()

function getDocumentResultState(postingId: string) {
  const state = documentResultStates.get(postingId)

  if (state) {
    return state
  }

  const initialState = DOCUMENT_RESULT_SAMPLE.map((applicant) => ({ ...applicant }))
  documentResultStates.set(postingId, initialState)
  return initialState
}

// TODO: 면접 없는 공고 확인용, 공고의 면접 사용 여부 API 확정 후 삭제
const NO_INTERVIEW_POSTING_ID = '3'

const documentResultConfirmedAt = new Map<string, string>()

// TODO: 로딩 상태 확인용 응답 지연, API 교체 시 삭제
const DOCUMENT_RESULT_MOCK_LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 800

// 순위는 필터와 무관한 공고 전체 기준, 동점은 같은 순위
function withRank(applicants: readonly DocumentResultEntry[]) {
  return applicants.map((applicant) => ({
    ...applicant,
    rank: applicants.filter((other) => other.averageScore > applicant.averageScore).length + 1,
  }))
}

function matchesResultStatus(
  applicant: Pick<DocumentResultApplicant, 'result'>,
  status: DocumentResultStatus,
) {
  return status === 'all' || applicant.result === status
}

function compareDocumentResults(
  a: DocumentResultApplicant,
  b: DocumentResultApplicant,
  sort: DocumentResultSort,
) {
  switch (sort) {
    case 'rankDesc':
      return a.rank - b.rank || a.name.localeCompare(b.name, 'ko')
    case 'rankAsc':
      return b.rank - a.rank || a.name.localeCompare(b.name, 'ko')
    case 'nameAsc':
      return a.name.localeCompare(b.name, 'ko')
    case 'nameDesc':
      return b.name.localeCompare(a.name, 'ko')
  }
}

// TODO: 서류 평가 취합 API 확정 후 실제 요청으로 교체
async function getDocumentResultApplicants(
  postingId: string,
  query: DocumentResultQuery,
): Promise<DocumentResultApplicantPage> {
  await new Promise((resolve) => setTimeout(resolve, DOCUMENT_RESULT_MOCK_LATENCY_MS))

  const keyword = query.keyword.trim()
  const applicants = withRank(getDocumentResultState(postingId))
  const matchesKeyword = (applicant: DocumentResultApplicant) => applicant.name.includes(keyword)

  const filtered = applicants.filter(
    (applicant) => matchesKeyword(applicant) && query.positions.includes(applicant.position),
  )
  const statusCounts = countBy(DOCUMENT_RESULT_STATUSES, filtered, matchesResultStatus)
  // 포지션 메뉴 숫자는 포지션 선택을 제외한 탭·검색 결과 기준
  const positionCounts = countBy(
    DOCUMENT_REVIEW_POSITIONS,
    applicants.filter(
      (applicant) => matchesKeyword(applicant) && matchesResultStatus(applicant, query.status),
    ),
    (applicant, position) => applicant.position === position,
  )
  const list = filtered
    .filter((applicant) => matchesResultStatus(applicant, query.status))
    .sort((a, b) => compareDocumentResults(a, b, query.sort))

  return {
    ...paginate(list, query.page, DOCUMENT_RESULT_PAGE_SIZE),
    statusCounts,
    positionCounts,
    totalResultCounts: countBy(
      DOCUMENT_RESULTS,
      applicants,
      (applicant, result) => applicant.result === result,
    ),
  }
}

// TODO: 최종 결과 변경 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function updateDocumentResult(
  postingId: string,
  applicantId: string,
  result: DocumentResult,
) {
  documentResultStates.set(
    postingId,
    getDocumentResultState(postingId).map((applicant) =>
      applicant.id === applicantId ? { ...applicant, result } : applicant,
    ),
  )
}

// TODO: 공고 정보 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getDocumentResultOverview(postingId: string): Promise<DocumentResultOverview> {
  return {
    hasInterview: postingId !== NO_INTERVIEW_POSTING_ID,
    confirmedAt: documentResultConfirmedAt.get(postingId) ?? null,
  }
}

// TODO: 결과 확정 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function confirmDocumentResults(postingId: string) {
  documentResultConfirmedAt.set(postingId, new Date().toISOString())
}

export {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  updateDocumentResult,
}

import { ONGOING_RECRUITMENT_SAMPLE } from '@/features/recruitment/mocks/ongoingRecruitmentSample'
import {
  DOCUMENT_RESULT_PAGE_SIZE,
  DOCUMENT_RESULT_STATUSES,
  DOCUMENT_RESULTS,
  DOCUMENT_REVIEW_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_STATUSES,
  type DocumentResult,
  type DocumentResultApplicant,
  type DocumentResultApplicantPage,
  type DocumentResultOverview,
  type DocumentResultQuery,
  type DocumentResultSort,
  type DocumentResultStatus,
  type DocumentReviewApplicant,
  type DocumentReviewApplicantPage,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
  type OngoingRecruitment,
} from '@/features/recruitment/types'
import { DOCUMENT_RESULT_SAMPLE } from './documentResultSample'
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

function countBy<TKey extends string, TItem>(
  keys: readonly TKey[],
  applicants: readonly TItem[],
  matches: (applicant: TItem, key: TKey) => boolean,
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

  return {
    ...paginate(list, query.page, DOCUMENT_REVIEW_PAGE_SIZE),
    statusCounts,
    positionCounts,
  }
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

// 결과 변경이 탭·페이지 이동 후에도 유지되도록 메모리에 보관, 새로고침 시 초기화
let documentResultState: Omit<DocumentResultApplicant, 'rank'>[] = DOCUMENT_RESULT_SAMPLE.map(
  (applicant) => ({ ...applicant }),
)

// TODO: 점수 없는 공고 확인용, 공고의 점수 사용 여부 API 확정 후 삭제
const NO_SCORE_RECRUITMENT_ID = '2'
// TODO: 면접 없는 공고 확인용, 공고의 면접 사용 여부 API 확정 후 삭제
const NO_INTERVIEW_RECRUITMENT_ID = '3'

const documentResultConfirmedAt = new Map<string, string>()

// TODO: 로딩 상태 확인용 응답 지연, API 교체 시 삭제
const DOCUMENT_RESULT_MOCK_LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 800

// 순위는 필터와 무관한 공고 전체 기준, 동점은 같은 순위
// TODO: 점수 없는 공고의 순위 기준(합격 의견 많은순) 기획 확인 필요
function getRankValue(applicant: Omit<DocumentResultApplicant, 'rank'>) {
  return applicant.averageScore ?? applicant.opinionCounts.pass
}

function withRank(applicants: readonly Omit<DocumentResultApplicant, 'rank'>[]) {
  return applicants.map((applicant) => ({
    ...applicant,
    rank: applicants.filter((other) => getRankValue(other) > getRankValue(applicant)).length + 1,
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
  recruitmentId: string,
  query: DocumentResultQuery,
): Promise<DocumentResultApplicantPage> {
  await new Promise((resolve) => setTimeout(resolve, DOCUMENT_RESULT_MOCK_LATENCY_MS))

  const keyword = query.keyword.trim()
  const hasScore = recruitmentId !== NO_SCORE_RECRUITMENT_ID
  const applicants = withRank(
    documentResultState.map((applicant) => ({
      ...applicant,
      averageScore: hasScore ? applicant.averageScore : null,
    })),
  )
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
    hasScore,
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
  _recruitmentId: string,
  applicantId: string,
  result: DocumentResult,
) {
  documentResultState = documentResultState.map((applicant) =>
    applicant.id === applicantId ? { ...applicant, result } : applicant,
  )
}

// TODO: 공고 정보 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getDocumentResultOverview(recruitmentId: string): Promise<DocumentResultOverview> {
  return {
    hasInterview: recruitmentId !== NO_INTERVIEW_RECRUITMENT_ID,
    confirmedAt: documentResultConfirmedAt.get(recruitmentId) ?? null,
  }
}

// TODO: 결과 확정 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function confirmDocumentResults(recruitmentId: string) {
  documentResultConfirmedAt.set(recruitmentId, new Date().toISOString())
}

// TODO: 진행 중인 모집 API 연결 시 서버 정렬이 없으면 sortByUpcomingSchedule 적용, 현재는 Figma 순서
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getOngoingRecruitments(): Promise<OngoingRecruitment[]> {
  return ONGOING_RECRUITMENT_SAMPLE
}

export {
  confirmDocumentResults,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  getDocumentReviewApplicants,
  getOngoingRecruitments,
  updateDocumentResult,
}

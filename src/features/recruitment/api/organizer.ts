import {
  APPLICANT_MANAGEMENT_SCHEDULE_SAMPLE,
  APPLICATION_STAGE_COUNTS,
  APPLICATION_STAGE_POSTING_ID,
  getSampleSubmittedAt,
  NO_APPLICANT_POSTING_ID,
} from '@/features/recruitment/mocks/applicantManagementSample'
import { DOCUMENT_RESULT_SAMPLE } from '@/features/recruitment/mocks/documentResultSample'
import { DOCUMENT_REVIEW_SAMPLE } from '@/features/recruitment/mocks/documentReviewSample'
import {
  APPLICANT_MANAGEMENT_PAGE_SIZE,
  APPLICANT_POSITION_TABS,
  type ApplicantManagementPage,
  type ApplicantManagementQuery,
  type ApplicantPositionTab,
  type ManagedApplicant,
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
  type DocumentReviewPosition,
  type DocumentReviewQuery,
  type DocumentReviewSort,
  type DocumentReviewStatus,
  type RecruitmentProgress,
} from '@/features/recruitment/types'

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

type SortableApplicant = Pick<DocumentReviewApplicant, 'name' | 'submittedAt'>

function compareApplicants(a: SortableApplicant, b: SortableApplicant, sort: DocumentReviewSort) {
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
  _postingId: string,
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

// TODO: 점수 없는 공고 확인용, 공고의 점수 사용 여부 API 확정 후 삭제
const NO_SCORE_POSTING_ID = '2'
// TODO: 면접 없는 공고 확인용, 공고의 면접 사용 여부 API 확정 후 삭제
const NO_INTERVIEW_POSTING_ID = '3'

const documentResultConfirmedAt = new Map<string, string>()

// TODO: 로딩 상태 확인용 응답 지연, API 교체 시 삭제
const DOCUMENT_RESULT_MOCK_LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 800

// 순위는 필터와 무관한 공고 전체 기준, 동점은 같은 순위
// TODO: 점수 없는 공고의 순위 기준(합격 의견 많은순) 기획 확인 필요
function getRankValue(applicant: DocumentResultEntry) {
  return applicant.averageScore ?? applicant.opinionCounts.pass
}

function withRank(applicants: readonly DocumentResultEntry[]) {
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
  postingId: string,
  query: DocumentResultQuery,
): Promise<DocumentResultApplicantPage> {
  await new Promise((resolve) => setTimeout(resolve, DOCUMENT_RESULT_MOCK_LATENCY_MS))

  const keyword = query.keyword.trim()
  const hasScore = postingId !== NO_SCORE_POSTING_ID
  const applicants = withRank(
    getDocumentResultState(postingId).map((applicant) => ({
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

function matchesPositionTab(applicant: ManagedApplicant, tab: ApplicantPositionTab) {
  return tab === 'all' || applicant.position === tab
}

// 순서를 유지한 채 포지션별 인원만큼 앞에서부터 선택
function pickByPosition(
  applicants: readonly ManagedApplicant[],
  counts: Record<DocumentReviewPosition, number>,
) {
  const remaining = { ...counts }

  return applicants.filter((applicant) => {
    if (remaining[applicant.position] === 0) {
      return false
    }
    remaining[applicant.position] -= 1
    return true
  })
}

// 서류 평가 취합과 같은 지원자를 써서 결과 확정이 그대로 반영
function getApplicantManagementCase(postingId: string): {
  applicants: ManagedApplicant[]
  progress: RecruitmentProgress
} {
  const schedule = APPLICANT_MANAGEMENT_SCHEDULE_SAMPLE
  const isConfirmed = documentResultConfirmedAt.has(postingId)
  const applicants: ManagedApplicant[] = getDocumentResultState(postingId).map(
    ({ id, name, position, result }, index) => ({
      id,
      name,
      position,
      submittedAt: getSampleSubmittedAt(index),
      // 보류가 남아 있으면 확정할 수 없어 확정 후에는 합격·불합격만 존재
      documentResult: isConfirmed && result !== 'hold' ? result : null,
    }),
  )

  if (postingId === NO_APPLICANT_POSTING_ID) {
    return { applicants: [], progress: { stage: 'application', hasInterview: true, schedule } }
  }

  if (postingId === APPLICATION_STAGE_POSTING_ID) {
    return {
      applicants: pickByPosition(applicants, APPLICATION_STAGE_COUNTS),
      progress: { stage: 'application', hasInterview: true, schedule },
    }
  }

  if (postingId === NO_INTERVIEW_POSTING_ID) {
    return {
      applicants,
      progress: {
        stage: isConfirmed ? 'finalResult' : 'documentReview',
        hasInterview: false,
        schedule,
      },
    }
  }

  return {
    applicants,
    progress: {
      stage: isConfirmed ? 'documentResult' : 'documentReview',
      hasInterview: true,
      schedule,
    },
  }
}

// TODO: postingApplications 연결 후 실제 요청으로 교체, 탭 숫자도 검색 적용 후 기준
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getApplicantManagementApplicants(
  postingId: string,
  query: ApplicantManagementQuery,
): Promise<ApplicantManagementPage> {
  const { applicants, progress } = getApplicantManagementCase(postingId)
  const keyword = query.keyword.trim()
  const searched = applicants.filter((applicant) => applicant.name.includes(keyword))
  const list = searched
    .filter((applicant) => matchesPositionTab(applicant, query.status))
    .sort((a, b) => compareApplicants(a, b, query.sort))

  return {
    ...paginate(list, query.page, APPLICANT_MANAGEMENT_PAGE_SIZE),
    tabCounts: countBy(APPLICANT_POSITION_TABS, searched, matchesPositionTab),
    progress,
  }
}

export {
  confirmDocumentResults,
  getApplicantManagementApplicants,
  getDocumentResultApplicants,
  getDocumentResultOverview,
  getDocumentReviewApplicants,
  updateDocumentResult,
}

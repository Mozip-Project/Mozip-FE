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

// 탭·포지션·정렬·검색·페이지를 URL로 관리하는 모집 관리 목록 공통 조건
type RecruitmentBoardQuery<TStatus extends string, TSort extends string> = {
  status: TStatus
  positions: readonly DocumentReviewPosition[]
  sort: TSort
  keyword: string
  page: number
}

type DocumentReviewQuery = RecruitmentBoardQuery<DocumentReviewStatus, DocumentReviewSort>

type DocumentReviewApplicantPage = {
  applicants: DocumentReviewApplicant[]
  statusCounts: Record<DocumentReviewStatus, number>
  positionCounts: Record<DocumentReviewPosition, number>
  currentPage: number
  totalPages: number
}

const DOCUMENT_RESULT_PAGE_SIZE = 10

const DOCUMENT_RESULTS = ['pass', 'hold', 'fail'] as const
const DOCUMENT_RESULT_STATUSES = ['all', ...DOCUMENT_RESULTS] as const
// 순위 기준은 서버 담당, 점수 있는 공고는 평균 점수·없는 공고는 합격 의견 수
const DOCUMENT_RESULT_SORTS = ['rankDesc', 'rankAsc', 'nameAsc', 'nameDesc'] as const

type DocumentResult = (typeof DOCUMENT_RESULTS)[number]
type DocumentResultStatus = (typeof DOCUMENT_RESULT_STATUSES)[number]
type DocumentResultSort = (typeof DOCUMENT_RESULT_SORTS)[number]

const DOCUMENT_RESULT_STATUS_LABEL = {
  all: '전체',
  pass: '합격',
  hold: '보류',
  fail: '불합격',
} satisfies Record<DocumentResultStatus, string>

const DOCUMENT_RESULT_SORT_LABEL = {
  rankDesc: '점수 높은순',
  rankAsc: '점수 낮은순',
  nameAsc: '이름 가나다순',
  nameDesc: '이름 역순',
} satisfies Record<DocumentResultSort, string>

// 점수 없는 공고는 합격 의견 많은순만 제공
const DOCUMENT_RESULT_NO_SCORE_SORTS = [
  'rankDesc',
  'nameAsc',
  'nameDesc',
] as const satisfies readonly DocumentResultSort[]

const DOCUMENT_RESULT_NO_SCORE_SORT_LABEL = {
  ...DOCUMENT_RESULT_SORT_LABEL,
  rankDesc: '합격 의견 많은순',
} satisfies Record<(typeof DOCUMENT_RESULT_NO_SCORE_SORTS)[number], string>

type DocumentResultApplicant = {
  id: string
  name: string
  position: DocumentReviewPosition
  rank: number
  opinionCounts: Record<DocumentResult, number>
  // null은 점수 없는 공고
  averageScore: number | null
  result: DocumentResult
}

type DocumentResultQuery = RecruitmentBoardQuery<DocumentResultStatus, DocumentResultSort>

type DocumentResultApplicantPage = {
  applicants: DocumentResultApplicant[]
  statusCounts: Record<DocumentResultStatus, number>
  positionCounts: Record<DocumentReviewPosition, number>
  currentPage: number
  totalPages: number
  // 지원서 양식에서 점수를 받는 공고인지
  hasScore: boolean
  // 확정 버튼 활성·확정 팝업 요약용, 필터·검색과 무관한 공고 전체 기준
  totalResultCounts: Record<DocumentResult, number>
}

type DocumentResultOverview = {
  hasInterview: boolean
  // null은 확정 전
  confirmedAt: string | null
}

// 결과 안내 메시지는 합격·불합격 두 종류만 발송
type ResultNoticeTarget = Extract<DocumentResult, 'pass' | 'fail'>

const RESULT_NOTICE_TARGETS = ['pass', 'fail'] as const satisfies readonly ResultNoticeTarget[]

const RESULT_NOTICE_TARGET_LABEL = {
  pass: '합격자',
  fail: '불합격자',
} satisfies Record<ResultNoticeTarget, string>

// TODO: 결과 안내 API 명세 확정 후 서버 변수명과 맞추기
const RESULT_NOTICE_VARIABLES = [
  '이름',
  '공고명',
  '포지션',
  '면접 기간',
  '면접 일시',
  '면접 장소',
] as const

type ResultNoticeVariable = (typeof RESULT_NOTICE_VARIABLES)[number]

// 값이 없는 변수는 미리보기에 `{변수}` 그대로 표시
type ResultNoticeVariableValues = Partial<Record<ResultNoticeVariable, string>>

type ResultNoticeMessage = {
  subject: string
  body: string
}

type RecipientDelivery =
  | { status: 'pending' }
  | { status: 'delivered' }
  | { status: 'failed'; message: string }
  | { status: 'emailCheck'; message: string }

type ResultNoticeRecipient = {
  id: string
  name: string
  position: DocumentReviewPosition
  email: string
  delivery: RecipientDelivery
}

type ResultNoticeOverview = {
  organizationName: string
  // 확정된 합격·불합격 지원자, 탭 숫자도 이 인원 기준
  recipients: Record<ResultNoticeTarget, ResultNoticeRecipient[]>
}

type ResultNoticeMissingField = 'subject' | 'body' | 'both'

// 결과 안내 하단 바 상태
type ResultNoticeSendState =
  // 불합격자 0명, 합격 메시지만 확인. 빈 칸이 없으면 missingField는 null
  | { type: 'allPassed'; missingField: ResultNoticeMissingField | null }
  // 불합격자 탭에 들어가기 전(지금 탭은 합격자), 불합격자 탭 진입 시 확인 처리
  | { type: 'reviewPending'; canSendCurrent: boolean }
  // target은 빈 칸이 있는 탭, 지금 탭이 아니면 지금 탭만 발송 가능
  | { type: 'missingInput'; target: ResultNoticeTarget; missingField: ResultNoticeMissingField }
  | { type: 'ready' }
  | { type: 'sending' }
  | { type: 'partiallySent'; unsentTarget: ResultNoticeTarget }
  | { type: 'allSent' }

// TODO: 모집 단계 API 명세 확정 후 서버 enum으로 교체
const RECRUITMENT_STAGES = [
  'posting',
  'application',
  'documentReview',
  'documentResult',
  'interviewReview',
  'finalResult',
] as const

type RecruitmentStage = (typeof RECRUITMENT_STAGES)[number]

// 완료일은 해당 단계를 마친 뒤에만 존재
type RecruitmentSchedule = {
  postingCompletedAt: string | null
  applicationDeadline: string
  documentReviewCompletedAt: string | null
  documentResultDate: string
  interviewReviewCompletedAt: string | null
  finalResultDate: string
}

type RecruitmentProgress = {
  stage: RecruitmentStage
  hasInterview: boolean
  schedule: RecruitmentSchedule
}

export {
  DOCUMENT_RESULT_NO_SCORE_SORT_LABEL,
  DOCUMENT_RESULT_NO_SCORE_SORTS,
  DOCUMENT_RESULT_PAGE_SIZE,
  DOCUMENT_RESULT_SORT_LABEL,
  DOCUMENT_RESULT_SORTS,
  DOCUMENT_RESULT_STATUS_LABEL,
  DOCUMENT_RESULT_STATUSES,
  DOCUMENT_RESULTS,
  DOCUMENT_REVIEW_PAGE_SIZE,
  DOCUMENT_REVIEW_POSITION_LABEL,
  DOCUMENT_REVIEW_POSITIONS,
  DOCUMENT_REVIEW_SORT_LABEL,
  DOCUMENT_REVIEW_SORTS,
  DOCUMENT_REVIEW_STATUS_LABEL,
  DOCUMENT_REVIEW_STATUSES,
  RECRUITMENT_STAGES,
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  RESULT_NOTICE_VARIABLES,
}
export type {
  DocumentResult,
  DocumentResultApplicant,
  DocumentResultApplicantPage,
  DocumentResultOverview,
  DocumentResultQuery,
  DocumentResultSort,
  DocumentResultStatus,
  DocumentReviewApplicant,
  DocumentReviewApplicantPage,
  DocumentReviewPosition,
  DocumentReviewQuery,
  DocumentReviewSort,
  DocumentReviewStatus,
  RecipientDelivery,
  RecruitmentBoardQuery,
  RecruitmentProgress,
  RecruitmentSchedule,
  RecruitmentStage,
  ResultNoticeMessage,
  ResultNoticeMissingField,
  ResultNoticeOverview,
  ResultNoticeRecipient,
  ResultNoticeSendState,
  ResultNoticeTarget,
  ResultNoticeVariable,
  ResultNoticeVariableValues,
}

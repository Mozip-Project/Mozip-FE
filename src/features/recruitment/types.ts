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

// TODO: 모집 단계 API 명세 확정 후 서버 enum으로 교체
// MVP의 면접 모집은 서류 결과 안내까지, 면접 평가·최종 결과 단계는 이후 확장
const INTERVIEW_RECRUITMENT_STAGES = [
  'posting',
  'application',
  'documentReview',
  'documentResult',
] as const

const NO_INTERVIEW_RECRUITMENT_STAGES = [
  'posting',
  'application',
  'documentReview',
  'finalResult',
] as const

type InterviewRecruitmentStage = (typeof INTERVIEW_RECRUITMENT_STAGES)[number]
type NoInterviewRecruitmentStage = (typeof NO_INTERVIEW_RECRUITMENT_STAGES)[number]
type RecruitmentStage = InterviewRecruitmentStage | NoInterviewRecruitmentStage

// 완료일은 해당 단계를 마친 뒤에만 존재
type RecruitmentSchedule = {
  postingCompletedAt: string | null
  applicationDeadline: string
  documentReviewCompletedAt: string | null
  documentResultDate: string
  // 면접 모집은 MVP 단계에 없지만 최종 결과 단계 확장용으로 유지
  finalResultDate: string
}

type RecruitmentProgress =
  | { hasInterview: true; stage: InterviewRecruitmentStage; schedule: RecruitmentSchedule }
  | { hasInterview: false; stage: NoInterviewRecruitmentStage; schedule: RecruitmentSchedule }

type OngoingRecruitment = {
  id: string
  title: string
  progress: RecruitmentProgress
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
  INTERVIEW_RECRUITMENT_STAGES,
  NO_INTERVIEW_RECRUITMENT_STAGES,
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
  InterviewRecruitmentStage,
  NoInterviewRecruitmentStage,
  OngoingRecruitment,
  RecruitmentBoardQuery,
  RecruitmentProgress,
  RecruitmentSchedule,
  RecruitmentStage,
  ResultNoticeMessage,
  ResultNoticeTarget,
  ResultNoticeVariable,
  ResultNoticeVariableValues,
}

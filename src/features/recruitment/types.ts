import type { DocResult, FinalResult } from '@/gql/graphql'

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

// 평가 버튼, 결과 확정 뒤에는 평가 보기만 가능
type DocumentReviewAction = 'evaluate' | 'edit' | 'view'

type DocumentReviewApplicant = {
  id: string
  name: string
  // 포지션 없는 모집은 null
  positionName: string | null
  submittedAt: string | null
  action: DocumentReviewAction
}

// 탭·포지션·정렬·검색·페이지를 URL로 관리하는 모집 관리 목록 공통 조건
type RecruitmentBoardQuery<
  TStatus extends string,
  TSort extends string,
  TPosition extends string = DocumentReviewPosition,
> = {
  status: TStatus
  positions: readonly TPosition[]
  sort: TSort
  keyword: string
  page: number
}

// 포지션은 서버 포지션 ID, 빈 목록은 전체 포지션
type DocumentReviewQuery = RecruitmentBoardQuery<DocumentReviewStatus, DocumentReviewSort, string>

type DocumentReviewPositionOption = {
  value: string
  label: string
  count: number
}

type DocumentReviewApplicantPage = {
  applicants: DocumentReviewApplicant[]
  statusCounts: Record<DocumentReviewStatus, number>
  // 포지션 없는 모집은 빈 목록
  positionOptions: DocumentReviewPositionOption[]
  currentPage: number
  totalPages: number
  hasPositions: boolean
}

const DOCUMENT_RESULT_PAGE_SIZE = 10

const DOCUMENT_RESULTS = ['pass', 'hold', 'fail'] as const
const DOCUMENT_RESULT_STATUSES = ['all', ...DOCUMENT_RESULTS] as const
// 순위 기준(평균 점수)은 서버 담당
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

type DocumentResultApplicant = {
  id: string
  name: string
  // 포지션 없는 모집은 null
  positionName: string | null
  // 평가 완료 전에는 null
  rank: number | null
  // pending은 아직 평가를 저장하지 않은 운영진 수
  opinionCounts: Record<DocumentResult | 'pending', number>
  // 점수 안 쓰는 공고이거나 저장된 평가가 없으면 null
  averageScore: number | null
  // 아직 고르지 않았으면 null
  result: DocumentResult | null
  // 운영진 전원이 평가를 저장했을 때만 결과 선택 가능
  isEvaluationComplete: boolean
}

// 포지션은 서버 포지션 ID, 빈 목록은 전체 포지션
type DocumentResultQuery = RecruitmentBoardQuery<DocumentResultStatus, DocumentResultSort, string>

// 확정 버튼·확정 팝업·하단 바용, 필터·검색과 무관한 공고 전체 기준
type DocumentResultTotals = {
  totalCount: number
  evaluatedCount: number
  isAllEvaluated: boolean
  passCount: number
  holdCount: number
  failCount: number
  // 결과를 아직 고르지 않은 인원
  pendingCount: number
  canConfirm: boolean
}

type DocumentResultApplicantPage = {
  applicants: DocumentResultApplicant[]
  statusCounts: Record<DocumentResultStatus, number>
  // 포지션 없는 모집은 빈 목록
  positionOptions: DocumentReviewPositionOption[]
  currentPage: number
  totalPages: number
  hasPositions: boolean
  hasInterview: boolean
  // 공고의 결과 확정 시각, null은 확정 전
  confirmedAt: string | null
  totals: DocumentResultTotals
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

// 면접 정보 안내에서만 있음, 확정한 타임테이블 값
type ResultNoticeInterviewSchedule = {
  dateTime: string
  // 장소를 정하지 않은 면접 칸은 null
  place: string | null
}

type ResultNoticeRecipient = {
  id: string
  name: string
  // 서버 포지션 이름, 포지션 없는 모집은 null
  position: string | null
  // 연락 이메일이 없으면 null
  email: string | null
  delivery: RecipientDelivery
  interviewSchedule?: ResultNoticeInterviewSchedule
}

// 발송 중 재조회 간격, 진행 막대 전환 시간과 같음
const RESULT_NOTICE_POLL_INTERVAL_MS = 2000

// 이미 발송했거나 발송 중인 메시지에 저장·발송 요청
const MESSAGE_ALREADY_SENT_CODE = 'MESSAGE_409'

// 서류 결과만 안내(취합에서 진입)와 면접 정보까지 안내(타임테이블 확정 후 진입)
type ResultNoticeKind = 'document' | 'interview'

// 발송 창·하단 바 문구의 발송 대상
const RESULT_NOTICE_SEND_SUBJECT = {
  document: '서류 결과를',
  interview: '서류 결과와 면접 일정을',
} satisfies Record<ResultNoticeKind, string>

// 대상 하나의 발송 결과, 받는 사람별 전달 상태 포함
type ResultNoticeTargetSendResult = {
  message: ResultNoticeMessage
  recipients: ResultNoticeRecipient[]
  // 발송 중이면 받는 사람별 결과 대신 진행률 조회의 전달 수
  sendingDeliveredCount?: number
}

// 이메일 확인 필요 인원은 발송 인원에서 제외
type ResultNoticeDeliverySummary = {
  totalCount: number
  sentCount: number
  deliveredCount: number
  failedRecipients: ResultNoticeRecipient[]
}

type ResultNoticeMissingField = 'subject' | 'body' | 'both'

// 결과 안내 하단 바 상태
type ResultNoticeSendState =
  // 한쪽 탭 받는 사람 0명, target 메시지만 확인. 빈 칸이 없으면 missingField는 null
  | {
      type: 'singleTarget'
      target: ResultNoticeTarget
      missingField: ResultNoticeMissingField | null
    }
  // 불합격자 탭에 들어가기 전(지금 탭은 합격자), 불합격자 탭 진입 시 확인 처리
  | { type: 'reviewPending'; canSendCurrent: boolean }
  // target은 빈 칸이 있는 탭, 지금 탭이 아니면 지금 탭만 발송 가능
  | { type: 'missingInput'; target: ResultNoticeTarget; missingField: ResultNoticeMissingField }
  | { type: 'ready' }
  | { type: 'sending' }
  // 한쪽만 발송, 남은 탭 메시지가 비어 있으면 발송 불가
  | { type: 'partiallySent'; unsentTarget: ResultNoticeTarget; canSendUnsent: boolean }
  | { type: 'allSent' }

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

const APPLICANT_MANAGEMENT_PAGE_SIZE = 10

const APPLICANT_ALL_POSITIONS_TAB = 'all'

// 전체 탭 또는 공고마다 다른 서버 포지션 ID
type ApplicantPositionTab = string

type ManagedApplicant = {
  id: string
  name: string
  // 포지션 없는 모집은 null
  positionName: string | null
  documentResult: DocResult
  finalResult: FinalResult
}

// 결과 칩 표시 기준, 확정 전에는 서버 결과가 있어도 숨김
type DocumentResultPhase = 'beforeReview' | 'inReview' | 'confirmed'

type ApplicantManagementQuery = RecruitmentBoardQuery<ApplicantPositionTab, DocumentReviewSort>

type ApplicantManagementPage = {
  applicants: ManagedApplicant[]
  positionTabs: { value: ApplicantPositionTab; label: string; count: number }[]
  currentPage: number
  totalPages: number
  hasInterview: boolean
  hasPositions: boolean
  resultPhase: DocumentResultPhase
}
type RecruitmentStage = InterviewRecruitmentStage | NoInterviewRecruitmentStage

// 완료일은 해당 단계를 마친 뒤에만 존재, 마감·발표일 null은 모집 일정 입력 전인 작성 중 공고
type RecruitmentSchedule = {
  postingCompletedAt: string | null
  applicationDeadline: string | null
  documentReviewCompletedAt: string | null
  documentResultDate: string | null
  // 면접 모집은 MVP 단계에 없지만 최종 결과 단계 확장용으로 유지
  finalResultDate: string | null
}

type RecruitmentProgress =
  | { hasInterview: true; stage: InterviewRecruitmentStage; schedule: RecruitmentSchedule }
  | { hasInterview: false; stage: NoInterviewRecruitmentStage; schedule: RecruitmentSchedule }

// 지원서 작성 화면의 지원자 프로필, 휴대폰 번호는 가운데를 가린 값
type ApplicantProfile = {
  name: string
  savedPhotoUrl: string | null
  maskedPhone: string
  university: string
  // 스키마상 nullable, 없으면 프로필 카드에서 줄 숨김
  email: string | null
}

type TimetableSlotTime = {
  date: string
  time: string
}

type TimetableSlot = TimetableSlotTime & {
  // 같은 시간에 동시에 진행하는 면접 열, 1부터
  track: number
}

type TimetableApplicant = {
  id: string
  name: string
  positionName: string | null
  availableTimes: TimetableSlotTime[]
}

type TimetableInterviewer = {
  id: string
  name: string
  teamName: string | null
  isRepresentative: boolean
}

type TimetableInterview = TimetableSlot & {
  id: string
  applicantIds: string[]
  interviewerIds: string[]
  // 확정 후 입력, 그룹 면접은 칸 하나로 공유
  location: string | null
}

type TimetableDay = {
  date: string
  times: string[]
  trackCount: number
}

type InterviewTimetable = {
  days: TimetableDay[]
  interviews: TimetableInterview[]
  unassignedApplicantIds: string[]
}

// 옮길 지원자와 출발 면접, 미배정 바에서 출발하면 null
type TimetableMoveItem = {
  applicantIds: string[]
  fromInterviewId: string | null
}

type TimetableMoveTarget = { type: 'slot'; slot: TimetableSlot } | { type: 'unassigned' }

export {
  APPLICANT_ALL_POSITIONS_TAB,
  APPLICANT_MANAGEMENT_PAGE_SIZE,
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
  RESULT_NOTICE_SEND_SUBJECT,
  RESULT_NOTICE_TARGET_LABEL,
  MESSAGE_ALREADY_SENT_CODE,
  RESULT_NOTICE_POLL_INTERVAL_MS,
  RESULT_NOTICE_TARGETS,
  RESULT_NOTICE_VARIABLES,
}
export type {
  ApplicantProfile,
  ApplicantManagementPage,
  ApplicantManagementQuery,
  ApplicantPositionTab,
  DocumentResult,
  DocumentResultApplicant,
  DocumentResultApplicantPage,
  DocumentResultQuery,
  DocumentResultSort,
  DocumentResultTotals,
  DocumentResultPhase,
  DocumentResultStatus,
  DocumentReviewApplicant,
  DocumentReviewAction,
  DocumentReviewApplicantPage,
  DocumentReviewPosition,
  DocumentReviewQuery,
  DocumentReviewSort,
  DocumentReviewStatus,
  InterviewRecruitmentStage,
  InterviewTimetable,
  ManagedApplicant,
  RecipientDelivery,
  RecruitmentBoardQuery,
  RecruitmentProgress,
  RecruitmentSchedule,
  RecruitmentStage,
  ResultNoticeDeliverySummary,
  ResultNoticeKind,
  ResultNoticeMessage,
  ResultNoticeMissingField,
  ResultNoticeRecipient,
  ResultNoticeTargetSendResult,
  ResultNoticeSendState,
  ResultNoticeTarget,
  ResultNoticeVariable,
  ResultNoticeVariableValues,
  TimetableApplicant,
  TimetableDay,
  TimetableInterview,
  TimetableInterviewer,
  TimetableMoveItem,
  TimetableMoveTarget,
  TimetableSlot,
  TimetableSlotTime,
}

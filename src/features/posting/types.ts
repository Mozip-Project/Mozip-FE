import type { RecruitmentProgress } from '@/features/recruitment/types'

// TODO: 공고 목록 API 명세 확정 후 필터 값을 서버 enum으로 교체
const POSTING_SCOPES = ['campus', 'union'] as const
const POSTING_ACTIVITY_TYPES = ['club', 'society', 'studentCouncil'] as const
const POSTING_ACTIVITY_FIELDS = [
  'academic',
  'it',
  'design',
  'performance',
  'sports',
  'culture',
  'volunteer',
  'language',
  'business',
  'religion',
  'etc',
] as const

type PostingScope = (typeof POSTING_SCOPES)[number]
type PostingActivityType = (typeof POSTING_ACTIVITY_TYPES)[number]
type PostingActivityField = (typeof POSTING_ACTIVITY_FIELDS)[number]

const POSTING_SCOPE_LABEL = {
  campus: '교내 공고',
  union: '연합 공고',
} satisfies Record<PostingScope, string>

const POSTING_ACTIVITY_TYPE_LABEL = {
  club: '동아리',
  society: '학회',
  studentCouncil: '학생회',
} satisfies Record<PostingActivityType, string>

const POSTING_ACTIVITY_FIELD_LABEL = {
  academic: '학술 · 스터디',
  it: 'IT · 개발',
  design: '디자인 · 미디어',
  performance: '공연 · 음악',
  sports: '체육 · 스포츠',
  culture: '문화 · 취미',
  volunteer: '봉사 · 사회참여',
  language: '어학 · 국제교류',
  business: '창업 · 비즈니스',
  religion: '종교',
  etc: '기타',
} satisfies Record<PostingActivityField, string>

// 빈 배열은 해당 항목 전체(필터 없음)
type PostingFilterValues = {
  scopes: PostingScope[]
  activityTypes: PostingActivityType[]
  activityFields: PostingActivityField[]
}

// TODO: 공고 목록 API 명세 확정 후 정렬 값을 서버 enum으로 교체
const POSTING_SORTS = ['latest', 'deadline'] as const

type PostingSort = (typeof POSTING_SORTS)[number]

const POSTING_SORT_LABEL = {
  latest: '최신순',
  deadline: '마감 임박순',
} satisfies Record<PostingSort, string>

type PostingListQuery = PostingFilterValues & {
  keyword: string
  sort: PostingSort
  page: number
}

// TODO: 공고 관리 API 명세 확정 후 상태 값을 서버 enum으로 교체
const MANAGED_POSTING_STATUSES = ['published', 'draft', 'closed'] as const

type ManagedPostingStatus = (typeof MANAGED_POSTING_STATUSES)[number]

const MANAGED_POSTING_STATUS_LABEL = {
  published: '진행 중',
  draft: '작성 중',
  closed: '종료된 공고',
} satisfies Record<ManagedPostingStatus, string>

// UP하면 최신순 맨 위로 이동
const POSTING_UP_RANK = 1

type ManagedPostingBase = {
  id: string
  title: string
  progress: RecruitmentProgress
}

// 최신순 순위는 진행 중 공고만 존재
type ManagedPosting =
  | (ManagedPostingBase & { status: 'published'; latestRank: number })
  | (ManagedPostingBase & { status: Exclude<ManagedPostingStatus, 'published'> })

type ManagedPostingPreview = {
  title: string
  organizationType: string
  organizationName: string
  deadlineLabel: string
  tags: string[]
}

type ManagedPostingDetail = {
  id: string
  title: string
  // TODO: D-day 계산 기준 확정 후 날짜 필드로 교체
  postingDeadlineLabel: string
  recruitmentStartsAt: string
  recruitmentEndsAt: string
  documentResultDate: string
  // null은 면접 없는 모집
  interview: { method: string; startDate: string; endDate: string } | null
  finalResultDate: string
  activityArea: string
  membershipFee: string
  eligibility: string
  applicantCount: number
  preview: ManagedPostingPreview
}

// TODO: 공고 상세 API 명세 확정 후 아래 타입을 서버 응답 기준으로 교체
type PostingRichTextRun = {
  text: string
  isBold?: boolean
  isItalic?: boolean
}

// TODO: 공고 작성 편집기 저장 형식 확정 후 교체, 지금은 Figma 서식(H2·굵게·기울임·목록) 기준
type PostingContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; runs: PostingRichTextRun[] }
  | { type: 'list'; items: PostingRichTextRun[][] }

type PostingQuestion = {
  id: string
  title: string
}

type PostingPosition = {
  id: string
  name: string
  // null은 아직 지원하지 않은 포지션
  appliedAt: string | null
  questions: PostingQuestion[]
}

// 포지션 없는 모집(학생회 등)은 포지션 선택 없이 바로 지원
type PostingApplication =
  | { type: 'byPosition'; positions: PostingPosition[] }
  | { type: 'direct'; appliedAt: string | null }

type OrganizationOngoingPosting = {
  postingId: string
  title: string
  recruitmentStartsAt: string
  recruitmentEndsAt: string
}

type PostingOrganization = {
  name: string
  logoUrl: string | null
  activityType: PostingActivityType
  scope: PostingScope
  introduction: string
  activityFields: PostingActivityField[]
  keywords: string[]
  links: string[]
  ongoingPostings: OrganizationOngoingPosting[]
}

// 날짜·시각은 한국 시간(+09:00) ISO 문자열
type PostingDetail = {
  id: string
  title: string
  organization: PostingOrganization
  // null은 면접 없는 모집
  interview: { method: string; startDate: string; endDate: string } | null
  eligibility: string
  // null은 운영진이 입력하지 않은 항목
  activityArea: string | null
  membershipFee: string | null
  recruitmentStartsAt: string
  recruitmentEndsAt: string
  documentResultDate: string | null
  finalResultDate: string | null
  // TODO: 이미지 호스트 확정 후 next.config remotePatterns 추가
  coverImage: { src: string; width: number; height: number } | null
  content: PostingContentBlock[]
  questions: PostingQuestion[]
  application: PostingApplication
}

export {
  MANAGED_POSTING_STATUS_LABEL,
  MANAGED_POSTING_STATUSES,
  POSTING_ACTIVITY_FIELD_LABEL,
  POSTING_ACTIVITY_FIELDS,
  POSTING_ACTIVITY_TYPE_LABEL,
  POSTING_ACTIVITY_TYPES,
  POSTING_SCOPE_LABEL,
  POSTING_SCOPES,
  POSTING_SORT_LABEL,
  POSTING_SORTS,
  POSTING_UP_RANK,
}
export type {
  ManagedPosting,
  ManagedPostingDetail,
  ManagedPostingPreview,
  ManagedPostingStatus,
  OrganizationOngoingPosting,
  PostingActivityField,
  PostingActivityType,
  PostingApplication,
  PostingContentBlock,
  PostingDetail,
  PostingFilterValues,
  PostingListQuery,
  PostingOrganization,
  PostingPosition,
  PostingQuestion,
  PostingRichTextRun,
  PostingScope,
  PostingSort,
}

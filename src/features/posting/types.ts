import type {
  PostingActivityField as PostingQuestionActivityField,
  PostingFileType,
} from '@/features/posting/schemas/postingFormSchema'
import type { RecruitmentProgress } from '@/features/recruitment/types'
import type { OrganizationField, OrganizationType } from '@/gql/graphql'
import type { Route } from 'next'

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
  // 모집 마감까지 남은 날
  daysLeft: number
  tags: string[]
}

type ManagedPostingDetail = {
  id: string
  title: string
  // TODO: D-day 계산 기준 확정 후 날짜 필드로 교체
  postingDaysLeft: number
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

// 줄바꿈(br)은 text 안의 \n
type PostingRichTextRun = {
  text: string
  isBold?: boolean
  isItalic?: boolean
}

type PostingContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; runs: PostingRichTextRun[] }
  | { type: 'list'; items: PostingRichTextRun[][] }

type PostingQuestionBase = {
  id: string
  title: string
  // null은 운영진이 설명을 쓰지 않은 문항
  description: string | null
  isRequired: boolean
}

// TODO: 지원서 API 명세 확정 후 문항 유형별 필드를 서버 응답 기준으로 교체, 지금은 운영진 공고 작성 문항 기준
type PostingQuestion =
  | (PostingQuestionBase & { type: 'text'; maxLength: number })
  | (PostingQuestionBase & {
      type: 'activity'
      activityFields: PostingQuestionActivityField[]
      maxActivityCount: number
    })
  | (PostingQuestionBase & {
      type: 'file'
      acceptsFile: boolean
      acceptsLink: boolean
      fileTypes: PostingFileType[]
    })
  // 운영진이 면접 단계에서 연 30분 칸 시작 시각('YYYY-MM-DDTHH:mm')
  | (PostingQuestionBase & { type: 'availability'; interviewSlots: string[] })

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

type PostingQuestionPreview = {
  id: string
  title: string
}

type PostingPositionPreview = {
  id: string
  name: string
  questions: PostingQuestionPreview[]
}

type OrganizationOngoingPosting = {
  postingId: string
  title: string
  recruitmentStartsAt: string | null
  recruitmentEndsAt: string | null
}

type PostingOrganization = {
  name: string
  logoUrl: string | null
  type: OrganizationType
  tagline: string | null
  fields: OrganizationField[]
  keywords: string[]
  links: string[]
  ongoingPostings: OrganizationOngoingPosting[]
}

// 날짜는 한국 날짜(YYYY-MM-DD), null은 미입력
type PostingDetail = {
  id: string
  title: string
  organization: PostingOrganization
  hasInterview: boolean
  interviewPeriod: { startDate: string; endDate: string } | null
  eligibility: string | null
  activityArea: string | null
  membershipFee: string | null
  recruitmentStartsAt: string | null
  recruitmentEndsAt: string | null
  documentResultDate: string | null
  finalResultDate: string | null
  coverImageUrl: string | null
  content: PostingContentBlock[]
  // 빈 배열은 포지션 없는 모집
  positions: PostingPositionPreview[]
  questions: PostingQuestionPreview[]
}

type PostingRecruitmentPhase =
  | { status: 'upcoming'; daysLeft: number }
  | { status: 'open'; daysLeft: number }
  | { status: 'closed' }

type PostingListItem = {
  id: string
  href: Route
  title: string
  organizationType: string
  organizationName: string
  phase: PostingRecruitmentPhase
  tags: string[]
  thumbnailSrc?: string
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
  PostingListItem,
  PostingListQuery,
  PostingOrganization,
  PostingPosition,
  PostingPositionPreview,
  PostingQuestion,
  PostingQuestionPreview,
  PostingRecruitmentPhase,
  PostingRichTextRun,
  PostingScope,
  PostingSort,
}

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
const POSTING_SORTS = ['latest', 'deadline', 'popular'] as const

type PostingSort = (typeof POSTING_SORTS)[number]

const POSTING_SORT_LABEL = {
  latest: '최신순',
  deadline: '마감 임박순',
  popular: '인기순 (스크랩 많은 순)',
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
  published: '게시 중',
  draft: '작성 중',
  closed: '종료된 공고',
} satisfies Record<ManagedPostingStatus, string>

// UP하면 최신순 맨 위로 이동
const POSTING_UP_RANK = 1

type ManagedPostingBase = {
  id: string
  recruitmentId: string
  title: string
  progress: RecruitmentProgress
}

// 최신순 순위는 게시 중 공고만 존재
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
  recruitmentId: string
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
  PostingActivityField,
  PostingActivityType,
  PostingFilterValues,
  PostingListQuery,
  PostingScope,
  PostingSort,
}

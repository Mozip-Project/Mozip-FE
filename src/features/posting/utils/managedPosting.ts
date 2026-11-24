import type { ManagedPosting, ManagedPostingStatus } from '@/features/posting/types'
import type { RecruitmentProgress, RecruitmentSchedule } from '@/features/recruitment/types'
import type { ManagedPostingFieldsFragment, PostingStatus } from '@/gql/graphql'
import { getSeoulIsoDate } from '@/utils/date'

// 명세의 공고 관리 탭별 조회 상태
const MANAGED_POSTING_TAB_STATUSES = {
  published: ['RECRUITING', 'DOC_REVIEW', 'DOC_RESULT_NOTICE', 'INTERVIEW', 'FINAL_RESULT'],
  draft: ['DRAFT'],
  closed: ['ENDED'],
} as const satisfies Record<ManagedPostingStatus, readonly PostingStatus[]>

// 홈 스테퍼 위치, 서류 결과 안내 이후 단계는 공고 관리에서 다뤄 홈에서는 마지막 칸 유지
type HomeStage = 'posting' | 'application' | 'documentReview' | 'lastStage'

function getHomeStage(status: PostingStatus): HomeStage {
  switch (status) {
    case 'DRAFT':
      return 'posting'
    case 'RECRUITING':
      return 'application'
    case 'DOC_REVIEW':
      return 'documentReview'
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
    case 'ENDED':
      return 'lastStage'
  }
}

function getTab(status: PostingStatus): ManagedPostingStatus {
  switch (status) {
    case 'DRAFT':
      return 'draft'
    case 'ENDED':
      return 'closed'
    case 'RECRUITING':
    case 'DOC_REVIEW':
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
    case 'FINAL_RESULT':
      return 'published'
  }
}

// 서버 시각 형식과 무관하게 한국 날짜로 표시
function toSeoulDate(dateTime: string | null) {
  return dateTime ? getSeoulIsoDate(new Date(dateTime)) : null
}

function toProgress(posting: ManagedPostingFieldsFragment): RecruitmentProgress {
  const schedule: RecruitmentSchedule = {
    postingCompletedAt: toSeoulDate(posting.publishedAt),
    applicationDeadline: toSeoulDate(posting.recruitEndAt),
    documentReviewCompletedAt: toSeoulDate(posting.docResultConfirmedAt),
    documentResultDate: toSeoulDate(posting.docResultAt),
    finalResultDate: toSeoulDate(posting.finalResultAt),
  }
  const homeStage = getHomeStage(posting.status)

  if (posting.hasInterview) {
    return {
      hasInterview: true,
      stage: homeStage === 'lastStage' ? 'documentResult' : homeStage,
      schedule,
    }
  }
  return {
    hasInterview: false,
    stage: homeStage === 'lastStage' ? 'finalResult' : homeStage,
    schedule,
  }
}

function toManagedPosting(posting: ManagedPostingFieldsFragment): ManagedPosting {
  const base = { id: posting.id, title: posting.title, progress: toProgress(posting) }
  const tab = getTab(posting.status)

  if (tab === 'published') {
    return {
      ...base,
      status: tab,
      latestRank: posting.bumpRank,
      canUp: posting.status === 'RECRUITING',
    }
  }
  return { ...base, status: tab }
}

export { MANAGED_POSTING_TAB_STATUSES, toManagedPosting }

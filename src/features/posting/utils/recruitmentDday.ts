import type { ManagedPostingFieldsFragment } from '@/gql/graphql'
import { formatDday, getDaysBetween, getSeoulIsoDate } from '@/utils/date'

type DdayPosting = Pick<ManagedPostingFieldsFragment, 'status' | 'recruitEndAt' | 'docResultAt'>

// 지원 접수는 마감일, 서류·면접 평가는 서류 결과 발표일까지
function getDdayTargetAt(posting: DdayPosting) {
  switch (posting.status) {
    case 'RECRUITING':
      return posting.recruitEndAt
    case 'DOC_REVIEW':
    case 'DOC_RESULT_NOTICE':
    case 'INTERVIEW':
      return posting.docResultAt
    case 'DRAFT':
    case 'FINAL_RESULT':
    case 'ENDED':
      return null
  }
}

function getRecruitmentDday(posting: DdayPosting, now: Date) {
  const targetAt = getDdayTargetAt(posting)

  if (!targetAt) {
    return null
  }

  const daysLeft = getDaysBetween(getSeoulIsoDate(now), getSeoulIsoDate(new Date(targetAt)))

  return daysLeft >= 0 ? formatDday(daysLeft) : null
}

export { getRecruitmentDday }

import type { OngoingRecruitment, RecruitmentProgress } from '@/features/recruitment/types'

// 현재 단계가 끝나는 마감·발표일, 작성 중인 공고는 다가오는 일정 없음
function getUpcomingScheduleDate({ stage, hasInterview, schedule }: RecruitmentProgress) {
  switch (stage) {
    case 'posting':
      return null
    case 'application':
      return schedule.applicationDeadline
    case 'documentReview':
      return hasInterview ? schedule.documentResultDate : schedule.finalResultDate
    case 'documentResult':
      return schedule.documentResultDate
    case 'finalResult':
      return schedule.finalResultDate
  }
}

function compareUpcomingSchedule(a: OngoingRecruitment, b: OngoingRecruitment) {
  const aDate = getUpcomingScheduleDate(a.progress)
  const bDate = getUpcomingScheduleDate(b.progress)

  if (aDate === null || bDate === null) {
    return Number(aDate === null) - Number(bDate === null)
  }

  return Date.parse(aDate) - Date.parse(bDate)
}

// 다가오는 일정 빠른순, 일정이 없는 모집은 뒤로
function sortByUpcomingSchedule(recruitments: readonly OngoingRecruitment[]) {
  return recruitments.toSorted(compareUpcomingSchedule)
}

export { sortByUpcomingSchedule }

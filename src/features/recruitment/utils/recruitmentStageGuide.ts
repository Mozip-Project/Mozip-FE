import type { RecruitmentProgress } from '@/features/recruitment/types'
import { formatMonthDayWithWeekday } from '@/utils/date'

function getRecruitmentStageGuideMessage({ stage, hasInterview, schedule }: RecruitmentProgress) {
  const documentResultDate = formatMonthDayWithWeekday(schedule.documentResultDate)
  const finalResultDate = formatMonthDayWithWeekday(schedule.finalResultDate)

  switch (stage) {
    case 'posting':
      return '공고 작성을 완료해 주세요'
    case 'application':
      return `지원 접수가 ${formatMonthDayWithWeekday(schedule.applicationDeadline)}에 마감돼요`
    case 'documentReview':
      // 면접 없는 모집은 서류 평가 뒤 바로 최종 결과
      return hasInterview
        ? `${documentResultDate}에 서류 결과가 안내될 예정이에요`
        : `${finalResultDate}에 최종 결과가 안내될 예정이에요`
    case 'documentResult':
      return `${documentResultDate}까지 서류 결과를 안내해 주세요`
    case 'finalResult':
      return `${finalResultDate}까지 최종 결과를 안내해 주세요`
  }
}

export { getRecruitmentStageGuideMessage }

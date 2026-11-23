import type { RecruitmentProgress } from '@/features/recruitment/types'
import { formatMonthDayWithWeekday } from '@/utils/date'

// 게시 검증으로 게시 후에는 날짜가 있어 작성 중 공고 외에는 나오지 않는 값
function formatGuideDate(date: string | null) {
  return date ? formatMonthDayWithWeekday(date) : '일정 미정'
}

function getRecruitmentStageGuideMessage({ stage, hasInterview, schedule }: RecruitmentProgress) {
  const documentResultDate = formatGuideDate(schedule.documentResultDate)
  const finalResultDate = formatGuideDate(schedule.finalResultDate)

  switch (stage) {
    case 'posting':
      return '공고 작성을 완료해 주세요'
    case 'application':
      return `지원 접수가 ${formatGuideDate(schedule.applicationDeadline)}에 마감돼요`
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

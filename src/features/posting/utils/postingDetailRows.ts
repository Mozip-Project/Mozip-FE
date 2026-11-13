import type { ManagedPostingDetail } from '@/features/posting/types'
import { formatMonthDayWithWeekday } from '@/utils/date'

type PostingDetailRow = {
  label: string
  value: string
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatMonthDayWithWeekday(startDate)} ~ ${formatMonthDayWithWeekday(endDate)}`
}

// 면접 없는 모집은 면접 행을 빼고 서류 결과 라벨만 표시
function getScheduleRows(detail: ManagedPostingDetail): PostingDetailRow[] {
  const documentResult = formatMonthDayWithWeekday(detail.documentResultDate)
  const finalResult = {
    label: '최종 발표',
    value: formatMonthDayWithWeekday(detail.finalResultDate),
  }
  const { interview } = detail

  if (!interview) {
    return [{ label: '서류 결과 발표', value: documentResult }, finalResult]
  }

  return [
    { label: '서류 결과 및 면접 일정 안내', value: documentResult },
    { label: '면접 기간', value: formatDateRange(interview.startDate, interview.endDate) },
    finalResult,
    { label: '면접', value: `있음 (${interview.method})` },
  ]
}

// 날짜·시각 문자열의 시각 부분만 잘라 써서 시간대와 무관하게 표시
function getPostingDetailRows(detail: ManagedPostingDetail): PostingDetailRow[] {
  const recruitmentEndTime = detail.recruitmentEndsAt.slice(11, 16)

  return [
    {
      label: '모집 기간',
      value: `${formatDateRange(detail.recruitmentStartsAt, detail.recruitmentEndsAt)} ${recruitmentEndTime}`,
    },
    ...getScheduleRows(detail),
    { label: '활동 지역', value: detail.activityArea },
    { label: '회비', value: detail.membershipFee },
    { label: '지원 자격', value: detail.eligibility },
  ]
}

export { getPostingDetailRows }
export type { PostingDetailRow }

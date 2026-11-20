import { addDays, toUtcDate } from '@/utils/calendar'
import { formatMonthDay, WEEKDAY_LABELS } from '@/utils/date'

const SUNDAY = 0

type InterviewDay = {
  date: string
  weekday: string
  dayLabel: string
  isSunday: boolean
}

type InterviewPeriod = {
  startDate: string
  endDate: string
  days: InterviewDay[]
}

function toInterviewDay(date: string): InterviewDay {
  const utcDate = toUtcDate(date)
  const weekdayIndex = utcDate.getUTCDay()
  const day = utcDate.getUTCDate()

  return {
    date,
    weekday: WEEKDAY_LABELS[weekdayIndex] ?? '',
    // 월이 바뀌는 1일에만 월 표시
    dayLabel: day === 1 ? formatMonthDay(date) : String(day),
    isSunday: weekdayIndex === SUNDAY,
  }
}

// 서류 결과 발표 다음 날 ~ 최종 결과 발표 전날
function getInterviewPeriod(documentResultDate: string, finalResultDate: string) {
  const startDate = addDays(documentResultDate, 1)
  const endDate = addDays(finalResultDate, -1)

  if (startDate > endDate) {
    return null
  }

  const days: InterviewDay[] = []
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    days.push(toInterviewDay(date))
  }

  return { startDate, endDate, days } satisfies InterviewPeriod
}

export { getInterviewPeriod, toInterviewDay }
export type { InterviewDay, InterviewPeriod }

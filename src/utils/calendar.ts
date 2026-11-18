import { WEEKDAY_LABELS } from './date'

type CalendarMonth = {
  year: number
  month: number
}

type CalendarDate = {
  date: string
  day: number
  isInMonth: boolean
}

const DAYS_PER_WEEK = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcDate(isoDate: string) {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getTodayIsoDate(now = new Date()) {
  return toIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

function addDays(isoDate: string, days: number) {
  return toIsoDate(new Date(toUtcDate(isoDate).getTime() + days * MS_PER_DAY))
}

function getCalendarMonth(isoDate: string): CalendarMonth {
  const date = toUtcDate(isoDate)

  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

function shiftMonth({ year, month }: CalendarMonth, delta: number): CalendarMonth {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))

  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

function isInCalendarMonth(isoDate: string, { year, month }: CalendarMonth) {
  const target = getCalendarMonth(isoDate)

  return target.year === year && target.month === month
}

function getFirstDateOfMonth({ year, month }: CalendarMonth) {
  return toIsoDate(new Date(Date.UTC(year, month - 1, 1)))
}

function getCalendarWeeks(calendarMonth: CalendarMonth): CalendarDate[][] {
  const { year, month } = calendarMonth
  const firstDate = new Date(Date.UTC(year, month - 1, 1))
  const leadingDays = firstDate.getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const weekCount = Math.ceil((leadingDays + daysInMonth) / DAYS_PER_WEEK)
  const gridStart = firstDate.getTime() - leadingDays * MS_PER_DAY

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, weekday) => {
      const date = new Date(gridStart + (week * DAYS_PER_WEEK + weekday) * MS_PER_DAY)

      return {
        date: toIsoDate(date),
        day: date.getUTCDate(),
        isInMonth: date.getUTCMonth() === month - 1,
      }
    }),
  )
}

function formatFullDateWithWeekday(isoDate: string) {
  const date = toUtcDate(isoDate)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${date.getUTCFullYear()}. ${month}. ${day} (${WEEKDAY_LABELS[date.getUTCDay()]})`
}

function formatCalendarDateLabel(isoDate: string) {
  const date = toUtcDate(isoDate)
  const weekday = WEEKDAY_LABELS[date.getUTCDay()]

  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일 ${weekday}요일`
}

export {
  addDays,
  formatCalendarDateLabel,
  formatFullDateWithWeekday,
  getCalendarMonth,
  getCalendarWeeks,
  getFirstDateOfMonth,
  getTodayIsoDate,
  isInCalendarMonth,
  shiftMonth,
}
export type { CalendarDate, CalendarMonth }

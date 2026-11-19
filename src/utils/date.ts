const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const DAY_MS = 24 * 60 * 60 * 1000

// en-CA 형식(YYYY-MM-DD) 사용, 서버 실행 시간대와 무관하게 한국 날짜 계산
const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// 날짜 부분만 사용해 실행 환경 시간대와 무관하게 요일 계산
function formatMonthDayWithWeekday(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    return ''
  }

  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

  return `${month}/${day} (${weekday})`
}

// 시각 부분만 잘라 써서 시간대와 무관하게 표시
function formatMonthDayTimeWithWeekday(isoDateTime: string) {
  return `${formatMonthDayWithWeekday(isoDateTime)} ${isoDateTime.slice(11, 16)}`
}

function formatDday(daysLeft: number) {
  return daysLeft === 0 ? 'D-day' : `D-${daysLeft}`
}

// 날짜 부분(YYYY-MM-DD)만 UTC 자정 시각으로 변환, 형식이 다르면 NaN
function getUtcTimeOfIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    return Number.NaN
  }

  return Date.UTC(year, month - 1, day)
}

function getSeoulIsoDate(date: Date) {
  return SEOUL_DATE_FORMATTER.format(date)
}

// 시각과 무관한 달력 일수 차이, 형식이 다르면 NaN
function getDaysBetween(fromIsoDate: string, toIsoDate: string) {
  return Math.round((getUtcTimeOfIsoDate(toIsoDate) - getUtcTimeOfIsoDate(fromIsoDate)) / DAY_MS)
}

function addDaysToIsoDate(isoDate: string, days: number) {
  return new Date(getUtcTimeOfIsoDate(isoDate) + days * DAY_MS).toISOString().slice(0, 10)
}

function isSameLocalDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

function formatDateTimeWithWeekday(date: Date) {
  const weekday = WEEKDAY_LABELS[date.getDay()]

  return `${date.getMonth() + 1}/${date.getDate()} (${weekday}) ${formatTime(date)}`
}

function formatSavedTime(savedAt: Date, now: Date) {
  return isSameLocalDate(savedAt, now) ? formatTime(savedAt) : formatDateTimeWithWeekday(savedAt)
}

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

// 날짜 부분만 잘라 써서 시간대와 무관하게 표시
function formatYearMonth(isoDate: string) {
  const [year, month] = isoDate.slice(0, 7).split('-')

  if (!year || !month) {
    return ''
  }

  return `${year}. ${month}`
}

export {
  addDaysToIsoDate,
  WEEKDAY_LABELS,
  formatDateTimeWithWeekday,
  formatDday,
  formatMonthDayTimeWithWeekday,
  formatMonthDayWithWeekday,
  formatRemainingTime,
  formatSavedTime,
  formatYearMonth,
  getDaysBetween,
  getSeoulIsoDate,
}

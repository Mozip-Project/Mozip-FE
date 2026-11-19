const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

// 날짜 부분만 사용해 실행 환경 시간대와 무관하게 요일 계산
function formatMonthDayWithWeekday(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    return ''
  }

  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

  return `${month}/${day} (${weekday})`
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

function getCalendarDayDiff(from: Date, to: Date) {
  const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  // 서머타임으로 하루가 23·25시간인 경우 보정
  return Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS)
}

// 24시간 안은 경과 시간, 그 뒤는 날짜 차이로 표시
function formatRelativeTime(date: Date, now: Date) {
  const elapsedMs = now.getTime() - date.getTime()

  if (elapsedMs < MINUTE_MS) {
    return '방금'
  }
  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}분 전`
  }
  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}시간 전`
  }

  const dayDiff = getCalendarDayDiff(date, now)
  return dayDiff === 1 ? '어제' : `${dayDiff}일 전`
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
  WEEKDAY_LABELS,
  formatDateTimeWithWeekday,
  formatMonthDayWithWeekday,
  formatRelativeTime,
  formatRemainingTime,
  formatSavedTime,
  formatYearMonth,
}

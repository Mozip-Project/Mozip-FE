const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

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
  formatDateTimeWithWeekday,
  formatMonthDayWithWeekday,
  formatRemainingTime,
  formatSavedTime,
  formatYearMonth,
}

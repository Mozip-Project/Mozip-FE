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

function formatSavedTime(savedAt: Date, now: Date) {
  const hours = String(savedAt.getHours()).padStart(2, '0')
  const minutes = String(savedAt.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`

  if (isSameLocalDate(savedAt, now)) {
    return time
  }

  const weekday = WEEKDAY_LABELS[savedAt.getDay()]
  return `${savedAt.getMonth() + 1}/${savedAt.getDate()} (${weekday}) ${time}`
}

export { formatMonthDayWithWeekday, formatSavedTime }

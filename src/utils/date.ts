const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// 'YYYY-MM-DD…' 문자열의 날짜 부분만 사용해 실행 환경 시간대와 무관하게 요일 계산
function formatMonthDayWithWeekday(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined) {
    return ''
  }

  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]

  return `${month}/${day} (${weekday})`
}

export { formatMonthDayWithWeekday }

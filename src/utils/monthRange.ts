const YEAR_DIGITS = 4
const YEAR_MONTH_DIGITS = 6
const MONTH_RANGE_MAX_DIGITS = YEAR_MONTH_DIGITS * 2

function formatYearMonth(digits: string) {
  if (digits.length <= YEAR_DIGITS) {
    return digits
  }
  return `${digits.slice(0, YEAR_DIGITS)}.${digits.slice(YEAR_DIGITS)}`
}

// 숫자만 남겨 'YYYY.MM ~ YYYY.MM'으로 정리, 구분자는 뒤에 숫자가 있을 때만 붙여 지우기 편하게 처리
function formatMonthRange(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, MONTH_RANGE_MAX_DIGITS)

  if (digits.length <= YEAR_MONTH_DIGITS) {
    return formatYearMonth(digits)
  }
  return `${formatYearMonth(digits.slice(0, YEAR_MONTH_DIGITS))} ~ ${formatYearMonth(digits.slice(YEAR_MONTH_DIGITS))}`
}

export { formatMonthRange }

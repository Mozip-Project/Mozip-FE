const PHONE_MAX_DIGITS = 11
const AREA_CODE_LENGTH = 3

// 010은 항상 11자리라 입력 중에도 3-4-4, 그 외 번호는 10자리 3-3-4·11자리 3-4-4
function getMiddleLength(digits: string) {
  return digits.startsWith('010') || digits.length === PHONE_MAX_DIGITS ? 4 : 3
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS)
  const middleEnd = AREA_CODE_LENGTH + getMiddleLength(digits)

  if (digits.length <= AREA_CODE_LENGTH) {
    return digits
  }

  if (digits.length <= middleEnd) {
    return `${digits.slice(0, AREA_CODE_LENGTH)}-${digits.slice(AREA_CODE_LENGTH)}`
  }

  return `${digits.slice(0, AREA_CODE_LENGTH)}-${digits.slice(AREA_CODE_LENGTH, middleEnd)}-${digits.slice(middleEnd)}`
}

export { formatPhoneNumber }

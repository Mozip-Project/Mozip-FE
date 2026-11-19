type NumberRange = {
  min: number
  max: number
}

function clampNumber(value: number, { min, max }: NumberRange) {
  return Math.min(Math.max(value, min), max)
}

function toDigits(value: string) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
}

function formatThousands(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 쉼표가 들어가거나 빠져도 커서 앞 숫자 개수를 유지할 위치
function getCaretAfterDigits(formatted: string, digitCount: number) {
  if (digitCount <= 0) {
    return 0
  }
  let seenDigits = 0

  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted.charAt(index))) {
      seenDigits += 1
    }
    if (seenDigits === digitCount) {
      return index + 1
    }
  }
  return formatted.length
}

export { clampNumber, formatThousands, getCaretAfterDigits, toDigits }
export type { NumberRange }

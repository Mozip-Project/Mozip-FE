import { describe, expect, it } from 'vitest'
import { clampNumber, formatThousands, getCaretAfterDigits, toDigits } from './number'

describe('clampNumber', () => {
  const range = { min: 1, max: 10 }

  it('범위 안의 값은 그대로', () => {
    expect(clampNumber(3, range)).toBe(3)
    expect(clampNumber(1, range)).toBe(1)
    expect(clampNumber(10, range)).toBe(10)
  })

  it('범위를 벗어나면 가까운 경계값', () => {
    expect(clampNumber(0, range)).toBe(1)
    expect(clampNumber(11, range)).toBe(10)
  })
})

describe('toDigits', () => {
  it('숫자만 남기고 앞자리 0 제거', () => {
    expect(toDigits('30,000원')).toBe('30000')
    expect(toDigits('00300')).toBe('300')
    expect(toDigits('0')).toBe('0')
    expect(toDigits('abc')).toBe('')
  })
})

describe('formatThousands', () => {
  it('세 자리마다 쉼표', () => {
    expect(formatThousands('30000')).toBe('30,000')
    expect(formatThousands('1234567')).toBe('1,234,567')
    expect(formatThousands('999')).toBe('999')
    expect(formatThousands('')).toBe('')
  })
})

describe('getCaretAfterDigits', () => {
  it('쉼표를 건너뛰어 같은 개수의 숫자 뒤에 커서', () => {
    expect(getCaretAfterDigits('30,000', 2)).toBe(2)
    expect(getCaretAfterDigits('30,000', 3)).toBe(4)
    expect(getCaretAfterDigits('1,234,567', 4)).toBe(5)
  })

  it('앞이나 끝을 넘으면 경계로', () => {
    expect(getCaretAfterDigits('30,000', 0)).toBe(0)
    expect(getCaretAfterDigits('30,000', 9)).toBe(6)
  })
})

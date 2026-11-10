import { describe, expect, it } from 'vitest'
import { formatPhoneNumber } from './phone'

describe('formatPhoneNumber', () => {
  it('숫자가 아닌 글자는 지움', () => {
    expect(formatPhoneNumber('')).toBe('')
    expect(formatPhoneNumber('abc-')).toBe('')
    expect(formatPhoneNumber('010 1234 5678')).toBe('010-1234-5678')
  })

  it('010은 입력 중에도 3-4-4로 나눔', () => {
    expect(formatPhoneNumber('010')).toBe('010')
    expect(formatPhoneNumber('0101')).toBe('010-1')
    expect(formatPhoneNumber('0101234')).toBe('010-1234')
    expect(formatPhoneNumber('01012345')).toBe('010-1234-5')
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678')
  })

  it('010 외 번호는 10자리 3-3-4, 11자리 3-4-4', () => {
    expect(formatPhoneNumber('0111234')).toBe('011-123-4')
    expect(formatPhoneNumber('0111234567')).toBe('011-123-4567')
    expect(formatPhoneNumber('01112345678')).toBe('011-1234-5678')
  })

  it('11자리를 넘는 숫자는 버림', () => {
    expect(formatPhoneNumber('010123456789')).toBe('010-1234-5678')
  })

  it('이미 하이픈이 있는 값도 같은 결과', () => {
    expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678')
  })
})

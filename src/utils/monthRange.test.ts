import { describe, expect, it } from 'vitest'
import { formatMonthRange } from './monthRange'

describe('formatMonthRange', () => {
  it('숫자가 아닌 글자는 지움', () => {
    expect(formatMonthRange('')).toBe('')
    expect(formatMonthRange('abc.~ ')).toBe('')
  })

  it('입력 중에는 뒤에 숫자가 있을 때만 구분자를 붙임', () => {
    expect(formatMonthRange('2025')).toBe('2025')
    expect(formatMonthRange('20250')).toBe('2025.0')
    expect(formatMonthRange('202509')).toBe('2025.09')
    expect(formatMonthRange('2025092')).toBe('2025.09 ~ 2')
    expect(formatMonthRange('2025092026')).toBe('2025.09 ~ 2026')
    expect(formatMonthRange('20250920260')).toBe('2025.09 ~ 2026.0')
    expect(formatMonthRange('202509202606')).toBe('2025.09 ~ 2026.06')
  })

  it('구분자 뒤 숫자를 지우면 구분자도 사라짐', () => {
    expect(formatMonthRange('2025.')).toBe('2025')
    expect(formatMonthRange('2025.09 ~ ')).toBe('2025.09')
  })

  it('이미 서식이 있는 값이나 붙여 넣은 값도 같은 결과', () => {
    expect(formatMonthRange('2025.09 ~ 2026.06')).toBe('2025.09 ~ 2026.06')
    expect(formatMonthRange('2025-09~2026-06')).toBe('2025.09 ~ 2026.06')
  })

  it('12자리를 넘는 숫자는 버림', () => {
    expect(formatMonthRange('2025092026061')).toBe('2025.09 ~ 2026.06')
  })
})

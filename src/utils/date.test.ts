import { describe, expect, it } from 'vitest'
import { formatMonthDayWithWeekday } from './date'

describe('formatMonthDayWithWeekday', () => {
  it('월/일 (요일) 형식으로 표시', () => {
    expect(formatMonthDayWithWeekday('2026-10-15T21:40')).toBe('10/15 (목)')
    expect(formatMonthDayWithWeekday('2026-10-12')).toBe('10/12 (월)')
  })

  it('한 자리 월·일은 0을 붙이지 않음', () => {
    expect(formatMonthDayWithWeekday('2026-03-01')).toBe('3/1 (일)')
  })
})

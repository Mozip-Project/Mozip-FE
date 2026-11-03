import { describe, expect, it } from 'vitest'
import { formatMonthDayWithWeekday, formatSavedTime } from './date'

describe('formatSavedTime', () => {
  const now = new Date(2026, 10, 4, 15, 0)

  it('오늘 저장했으면 시:분만 표시', () => {
    expect(formatSavedTime(new Date(2026, 10, 4, 14, 32), now)).toBe('14:32')
    expect(formatSavedTime(new Date(2026, 10, 4, 0, 5), now)).toBe('00:05')
  })

  it('오늘 이전이면 월/일 (요일) 시:분 표시', () => {
    expect(formatSavedTime(new Date(2026, 10, 3, 23, 59), now)).toBe('11/3 (화) 23:59')
    expect(formatSavedTime(new Date(2025, 10, 4, 9, 7), now)).toBe('11/4 (화) 09:07')
  })
})

describe('formatMonthDayWithWeekday', () => {
  it('월/일 (요일) 형식으로 표시', () => {
    expect(formatMonthDayWithWeekday('2026-10-15T21:40')).toBe('10/15 (목)')
    expect(formatMonthDayWithWeekday('2026-10-12')).toBe('10/12 (월)')
  })

  it('한 자리 월·일은 0을 붙이지 않음', () => {
    expect(formatMonthDayWithWeekday('2026-03-01')).toBe('3/1 (일)')
  })
})

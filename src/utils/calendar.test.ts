import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatCalendarDateLabel,
  formatFullDateWithWeekday,
  getCalendarMonth,
  getCalendarWeeks,
  getTodayIsoDate,
  isInCalendarMonth,
  shiftMonth,
} from './calendar'

describe('getCalendarWeeks', () => {
  it('일요일 시작 주 단위로 앞뒤 달 날짜를 채움', () => {
    const weeks = getCalendarWeeks({ year: 2026, month: 10 })

    expect(weeks).toHaveLength(5)
    expect(weeks[0]?.map((cell) => cell.day)).toEqual([27, 28, 29, 30, 1, 2, 3])
    expect(weeks[0]?.[3]).toEqual({ date: '2026-09-30', day: 30, isInMonth: false })
    expect(weeks[0]?.[4]).toEqual({ date: '2026-10-01', day: 1, isInMonth: true })
    expect(weeks[4]?.at(-1)).toEqual({ date: '2026-10-31', day: 31, isInMonth: true })
  })

  it('마지막 주의 남는 칸은 다음 달 날짜로 채움', () => {
    const weeks = getCalendarWeeks({ year: 2026, month: 11 })

    expect(weeks).toHaveLength(5)
    expect(weeks[4]?.map((cell) => cell.isInMonth)).toEqual([
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ])
    expect(weeks[4]?.at(-1)?.date).toBe('2026-12-05')
  })

  it('1일이 토요일이고 31일까지 있으면 6주', () => {
    expect(getCalendarWeeks({ year: 2026, month: 8 })).toHaveLength(6)
  })

  it('윤년 2월은 29일까지 포함', () => {
    const days = getCalendarWeeks({ year: 2028, month: 2 })
      .flat()
      .filter((cell) => cell.isInMonth)

    expect(days.at(-1)?.date).toBe('2028-02-29')
  })
})

describe('addDays', () => {
  it('달과 해를 넘어 이동', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-01-03', -7)).toBe('2025-12-27')
  })
})

describe('shiftMonth', () => {
  it('해를 넘어 달 이동', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
  })
})

describe('getCalendarMonth·isInCalendarMonth', () => {
  it('날짜가 속한 달 판별', () => {
    expect(getCalendarMonth('2026-10-01')).toEqual({ year: 2026, month: 10 })
    expect(isInCalendarMonth('2026-10-31', { year: 2026, month: 10 })).toBe(true)
    expect(isInCalendarMonth('2026-11-01', { year: 2026, month: 10 })).toBe(false)
  })
})

describe('getTodayIsoDate', () => {
  it('실행 환경의 현지 날짜 기준', () => {
    expect(getTodayIsoDate(new Date(2026, 9, 1, 23, 59))).toBe('2026-10-01')
  })
})

describe('formatCalendarDateLabel', () => {
  it('연 월 일 요일로 표시', () => {
    expect(formatCalendarDateLabel('2026-10-01')).toBe('2026년 10월 1일 목요일')
  })
})

describe('formatFullDateWithWeekday', () => {
  it('연. 월. 일 (요일) 형식으로 월·일은 두 자리 표시', () => {
    expect(formatFullDateWithWeekday('2026-10-01')).toBe('2026. 10. 01 (목)')
    expect(formatFullDateWithWeekday('2026-03-09T09:00')).toBe('2026. 03. 09 (월)')
  })

  it('날짜 형식이 아니면 빈 문자열', () => {
    expect(formatFullDateWithWeekday('')).toBe('')
    expect(formatFullDateWithWeekday('invalid')).toBe('')
  })
})

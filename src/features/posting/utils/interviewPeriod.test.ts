import { describe, expect, it } from 'vitest'
import { filterDatesInInterviewPeriod, getInterviewPeriod } from './interviewPeriod'

describe('filterDatesInInterviewPeriod', () => {
  const DATES = ['2026-10-22', '2026-10-23', '2026-10-27', '2026-10-28']

  it('서류 발표 다음 날부터 최종 발표 전날까지의 날짜만 유지', () => {
    expect(filterDatesInInterviewPeriod(DATES, '2026-10-22', '2026-10-28')).toEqual([
      '2026-10-23',
      '2026-10-27',
    ])
  })

  it('발표일이 비어 있으면 면접 기간이 없어 모두 제외', () => {
    expect(filterDatesInInterviewPeriod(DATES, null, '2026-10-28')).toEqual([])
  })
})

describe('getInterviewPeriod', () => {
  it('서류 발표 다음 날부터 최종 발표 전날까지, 1일은 월과 함께 표시', () => {
    const period = getInterviewPeriod('2026-10-22', '2026-11-02')

    expect(period?.startDate).toBe('2026-10-23')
    expect(period?.endDate).toBe('2026-11-01')
    expect(period?.days.map(({ dayLabel }) => dayLabel)).toEqual([
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '11/1',
    ])
    expect(period?.days[0]).toMatchObject({ weekday: '금', isSunday: false })
    expect(period?.days.filter((day) => day.isSunday).map((day) => day.date)).toEqual([
      '2026-10-25',
      '2026-11-01',
    ])
  })

  it('발표일 사이에 하루만 있으면 그 하루, 사이가 없으면 null', () => {
    expect(getInterviewPeriod('2026-10-22', '2026-10-24')?.days.map((day) => day.date)).toEqual([
      '2026-10-23',
    ])
    expect(getInterviewPeriod('2026-10-22', '2026-10-23')).toBeNull()
  })

  it('연말을 넘겨도 날짜와 1일 표시 유지', () => {
    expect(
      getInterviewPeriod('2026-12-30', '2027-01-03')?.days.map(({ dayLabel }) => dayLabel),
    ).toEqual(['31', '1/1', '2'])
  })
})

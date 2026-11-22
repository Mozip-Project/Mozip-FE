import { describe, expect, it } from 'vitest'
import { getDeadlineUrgency, getRecruitmentStatusLabel } from './scheduleBadge'

describe('getRecruitmentStatusLabel', () => {
  it('모집 중이면 마감까지 남은 날, 마감 당일은 D-DAY', () => {
    expect(getRecruitmentStatusLabel({ status: 'open', daysLeft: 1 })).toBe('마감 D-1')
    expect(getRecruitmentStatusLabel({ status: 'open', daysLeft: 0 })).toBe('마감 D-DAY')
  })

  it('모집 예정이면 시작까지 남은 날', () => {
    expect(getRecruitmentStatusLabel({ status: 'upcoming', daysLeft: 3 })).toBe('모집 예정 D-3')
  })

  it('마감 후에는 남은 날 없이 모집 마감', () => {
    expect(getRecruitmentStatusLabel({ status: 'closed' })).toBe('모집 마감')
  })
})

describe('getDeadlineUrgency', () => {
  it('D-DAY와 D-1은 임박', () => {
    expect(getDeadlineUrgency(0)).toBe('imminent')
    expect(getDeadlineUrgency(1)).toBe('imminent')
  })

  it('D-2부터 D-5까지는 가까움', () => {
    expect(getDeadlineUrgency(2)).toBe('soon')
    expect(getDeadlineUrgency(5)).toBe('soon')
  })

  it('D-6부터는 여유', () => {
    expect(getDeadlineUrgency(6)).toBe('relaxed')
    expect(getDeadlineUrgency(30)).toBe('relaxed')
  })
})

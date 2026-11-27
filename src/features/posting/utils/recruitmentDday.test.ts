import { describe, expect, it } from 'vitest'
import { getRecruitmentDday } from './recruitmentDday'

// 한국 시각 2026-10-11 09:00
const NOW = new Date('2026-10-11T00:00:00Z')

const POSTING = {
  status: 'RECRUITING',
  recruitEndAt: '2026-10-15T14:59:00Z',
  docResultAt: '2026-10-18T00:00:00Z',
} as const

describe('getRecruitmentDday', () => {
  it('지원 접수는 한국 날짜 기준 모집 마감일까지', () => {
    expect(getRecruitmentDday(POSTING, NOW)).toBe('D-4')
  })

  it('서류·면접 평가는 서류 결과 발표일까지', () => {
    expect(getRecruitmentDday({ ...POSTING, status: 'DOC_REVIEW' }, NOW)).toBe('D-7')
    expect(getRecruitmentDday({ ...POSTING, status: 'INTERVIEW' }, NOW)).toBe('D-7')
  })

  it('당일은 D-DAY', () => {
    expect(getRecruitmentDday({ ...POSTING, recruitEndAt: '2026-10-11T14:59:00Z' }, NOW)).toBe(
      'D-DAY',
    )
  })

  it('기준일이 지났거나 없으면 표시 안 함', () => {
    expect(getRecruitmentDday({ ...POSTING, recruitEndAt: '2026-10-10T14:59:00Z' }, NOW)).toBeNull()
    expect(getRecruitmentDday({ ...POSTING, recruitEndAt: null }, NOW)).toBeNull()
    expect(getRecruitmentDday({ ...POSTING, status: 'FINAL_RESULT' }, NOW)).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_SCHEDULE,
  getPostingScheduleSchema,
  type PostingScheduleValues,
} from './postingScheduleSchema'

const FILLED_SCHEDULE = {
  ...EMPTY_POSTING_SCHEDULE,
  recruitStartDate: '2026-10-01',
  recruitEndDate: '2026-10-08',
  documentResultDate: '2026-10-18',
  finalResultDate: '2026-10-28',
} satisfies PostingScheduleValues

function isValid(values: PostingScheduleValues, hasInterview = true) {
  return getPostingScheduleSchema(hasInterview).safeParse(values).success
}

describe('getPostingScheduleSchema', () => {
  it('면접은 모집 시작·마감, 서류 결과 발표일, 최종 결과 발표일이 필수', () => {
    expect(isValid(FILLED_SCHEDULE)).toBe(true)
    expect(isValid({ ...FILLED_SCHEDULE, documentResultDate: null })).toBe(false)
    expect(isValid({ ...FILLED_SCHEDULE, finalResultDate: null })).toBe(false)
    expect(isValid(EMPTY_POSTING_SCHEDULE)).toBe(false)
  })

  it('비면접은 서류 결과 발표일 없이 통과', () => {
    expect(isValid({ ...FILLED_SCHEDULE, documentResultDate: null }, false)).toBe(true)
    expect(isValid({ ...FILLED_SCHEDULE, recruitEndDate: null }, false)).toBe(false)
  })

  it('모집 마감이 시작보다 앞서면 실패, 시간이 없으면 시작 00:00·마감 23:59로 비교', () => {
    expect(isValid({ ...FILLED_SCHEDULE, recruitEndDate: '2026-09-30' })).toBe(false)
    expect(isValid({ ...FILLED_SCHEDULE, recruitEndDate: '2026-10-01' })).toBe(true)
    expect(
      isValid({
        ...FILLED_SCHEDULE,
        recruitEndDate: '2026-10-01',
        recruitStartTime: '12:00',
        recruitEndTime: '09:00',
      }),
    ).toBe(false)
  })

  it('활동 기간은 선택이지만 종료일이 시작일보다 앞서면 실패', () => {
    expect(isValid({ ...FILLED_SCHEDULE, activityStartDate: '2026-11-01' })).toBe(true)
    expect(
      isValid({
        ...FILLED_SCHEDULE,
        activityStartDate: '2026-11-01',
        activityEndDate: '2026-10-31',
      }),
    ).toBe(false)
  })
})

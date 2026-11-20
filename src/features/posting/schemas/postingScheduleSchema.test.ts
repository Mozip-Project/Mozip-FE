import { describe, expect, it } from 'vitest'
import {
  EMPTY_POSTING_SCHEDULE,
  getPostingScheduleSchema,
  getResultDateMinimums,
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

  it('발표일은 모집 마감 다음 날부터, 마감 당일 발표는 실패', () => {
    expect(isValid({ ...FILLED_SCHEDULE, documentResultDate: '2026-10-08' })).toBe(false)
    expect(isValid({ ...FILLED_SCHEDULE, documentResultDate: '2026-10-09' })).toBe(true)
    expect(
      isValid(
        { ...FILLED_SCHEDULE, documentResultDate: null, finalResultDate: '2026-10-08' },
        false,
      ),
    ).toBe(false)
    expect(
      isValid(
        { ...FILLED_SCHEDULE, documentResultDate: null, finalResultDate: '2026-10-09' },
        false,
      ),
    ).toBe(true)
  })

  it('면접 공고는 최종 발표가 서류 발표 이틀 뒤부터, 비면접은 서류 발표와 무관', () => {
    expect(isValid({ ...FILLED_SCHEDULE, finalResultDate: '2026-10-19' })).toBe(false)
    expect(isValid({ ...FILLED_SCHEDULE, finalResultDate: '2026-10-20' })).toBe(true)
    expect(isValid({ ...FILLED_SCHEDULE, finalResultDate: '2026-10-19' }, false)).toBe(true)
  })

  it('달력 최소 날짜는 마감 다음 날과 면접 기간 중 늦은 날', () => {
    expect(getResultDateMinimums(FILLED_SCHEDULE, true)).toEqual({
      documentResultDate: '2026-10-09',
      finalResultDate: '2026-10-20',
    })
    expect(
      getResultDateMinimums({ recruitEndDate: '2026-10-08', documentResultDate: null }, true),
    ).toEqual({ documentResultDate: '2026-10-09', finalResultDate: '2026-10-09' })
    expect(getResultDateMinimums(FILLED_SCHEDULE, false)).toEqual({
      documentResultDate: null,
      finalResultDate: '2026-10-09',
    })
  })
})

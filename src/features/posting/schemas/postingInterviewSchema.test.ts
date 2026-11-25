import { describe, expect, it } from 'vitest'
import { EMPTY_POSTING_INTERVIEW, postingInterviewSchema } from './postingInterviewSchema'

const FILLED = {
  interviewDuration: '30',
  interviewBreak: '0',
  interviewDates: ['2026-10-23'],
  interviewSlots: ['2026-10-23T09:00'],
  interviewApplicantCount: '1',
  interviewRoomCount: '2',
  documentResultDate: '2026-10-22',
  finalResultDate: '2026-10-28',
} as const

function isValid(values: Partial<Record<keyof typeof FILLED, unknown>>) {
  return postingInterviewSchema.safeParse({ ...FILLED, ...values }).success
}

describe('postingInterviewSchema', () => {
  it('빈 값은 실패, 모든 항목을 고르면 통과', () => {
    expect(postingInterviewSchema.safeParse(EMPTY_POSTING_INTERVIEW).success).toBe(false)
    expect(isValid({})).toBe(true)
  })

  it('선택 항목 중 하나라도 비면 실패, 쉬는 시간 0분은 선택으로 인정', () => {
    expect(isValid({ interviewBreak: '0' })).toBe(true)
    expect(isValid({ interviewBreak: null })).toBe(false)
    expect(isValid({ interviewApplicantCount: null })).toBe(false)
    expect(isValid({ interviewRoomCount: null })).toBe(false)
  })

  it('면접 날짜는 1일 이상 5일 이하', () => {
    const sixDays = ['23', '24', '25', '26', '27', '28'].map((day) => `2026-10-${day}`)

    expect(isValid({ interviewDates: [] })).toBe(false)
    expect(isValid({ interviewDates: sixDays.slice(0, 5) })).toBe(true)
    expect(isValid({ interviewDates: sixDays })).toBe(false)
  })

  it('면접 가능 기간 밖 날짜가 하나라도 있으면 실패', () => {
    expect(isValid({ documentResultDate: '2026-10-23' })).toBe(false)
    expect(isValid({ finalResultDate: '2026-10-23' })).toBe(false)
    expect(isValid({ documentResultDate: '2026-10-21', finalResultDate: '2026-10-24' })).toBe(true)
  })

  it('선택한 시간으로 면접을 1회 이상 잡을 수 있어야 통과', () => {
    expect(isValid({ interviewSlots: [] })).toBe(false)
    expect(isValid({ interviewDuration: '40' })).toBe(false)
    expect(
      isValid({
        interviewDuration: '40',
        interviewSlots: ['2026-10-23T09:00', '2026-10-23T09:30'],
      }),
    ).toBe(true)
  })

  it('다른 묶음으로 면접을 잡을 수 있어도 면접 1회 시간보다 짧은 묶음이 있으면 실패', () => {
    const oneHour = ['2026-10-23T09:00', '2026-10-23T09:30']

    expect(isValid({ interviewDuration: '40', interviewSlots: oneHour })).toBe(true)
    expect(
      isValid({ interviewDuration: '40', interviewSlots: [...oneHour, '2026-10-23T13:00'] }),
    ).toBe(false)
  })
})

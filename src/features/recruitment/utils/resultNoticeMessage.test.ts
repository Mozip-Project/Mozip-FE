import { describe, expect, it } from 'vitest'
import {
  fillNoticeVariables,
  formatInterviewPeriod,
  toNoticeVariables,
} from './resultNoticeMessage'

describe('fillNoticeVariables', () => {
  it('정의된 변수를 값으로 바꿈', () => {
    expect(
      fillNoticeVariables('{이름}님, {포지션} 합격입니다.', { 이름: '김모집', 포지션: '디자인' }),
    ).toBe('김모집님, 디자인 합격입니다.')
  })

  it('같은 변수가 여러 번 나오면 모두 바꿈', () => {
    expect(fillNoticeVariables('{이름} / {이름}', { 이름: '김모집' })).toBe('김모집 / 김모집')
  })

  it('값이 없는 변수는 그대로 유지', () => {
    expect(fillNoticeVariables('{면접 일시}에 만나요', { 이름: '김모집' })).toBe(
      '{면접 일시}에 만나요',
    )
  })

  it('정의되지 않은 중괄호 문구는 그대로 유지', () => {
    expect(fillNoticeVariables('{동아리} 안내', { 이름: '김모집' })).toBe('{동아리} 안내')
  })
})

describe('toNoticeVariables', () => {
  it('서버 변수를 순서대로 본문 변수 이름으로 바꿈', () => {
    expect(toNoticeVariables(['NAME', 'POSITION', 'INTERVIEW_AT'])).toEqual([
      '이름',
      '포지션',
      '면접 일시',
    ])
  })
})

describe('formatInterviewPeriod', () => {
  it('면접 날짜 중 첫 날과 마지막 날을 요일과 함께 표시', () => {
    expect(
      formatInterviewPeriod([
        { date: '2026-10-22' },
        { date: '2026-10-20' },
        { date: '2026-10-21' },
      ]),
    ).toBe('10/20 (화) ~ 10/22 (목)')
  })

  it('하루면 그 날만, 면접 날짜가 없으면 값 없음', () => {
    expect(formatInterviewPeriod([{ date: '2026-10-21' }])).toBe('10/21 (수)')
    expect(formatInterviewPeriod([])).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import { fillNoticeVariables } from './resultNoticeMessage'

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

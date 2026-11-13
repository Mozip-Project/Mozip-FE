import { describe, expect, it } from 'vitest'
import type { RecipientDelivery, ResultNoticeRecipient } from '@/features/recruitment/types'
import { countEmailCheckRecipients, getRecipientVariableValues } from './resultNoticeRecipient'

function createRecipient(id: string, delivery: RecipientDelivery): ResultNoticeRecipient {
  return {
    id,
    name: '김모집',
    position: 'design',
    email: `applicant${id}@example.com`,
    delivery,
  }
}

describe('getRecipientVariableValues', () => {
  it('받는 사람의 이름과 포지션 이름으로 변수 값을 채움', () => {
    expect(getRecipientVariableValues(createRecipient('1', { status: 'pending' }))).toEqual({
      이름: '김모집',
      포지션: '디자인',
    })
  })

  it('받는 사람이 없으면 빈 값', () => {
    expect(getRecipientVariableValues(undefined)).toEqual({})
  })
})

describe('countEmailCheckRecipients', () => {
  it('이메일 확인 필요 인원만 셈', () => {
    const recipients = [
      createRecipient('1', { status: 'pending' }),
      createRecipient('2', { status: 'emailCheck', message: 'gmail.com이 맞나요?' }),
      createRecipient('3', { status: 'failed', message: '메일 주소를 찾을 수 없어요' }),
    ]

    expect(countEmailCheckRecipients(recipients)).toBe(1)
  })
})

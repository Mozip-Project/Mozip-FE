import { describe, expect, it } from 'vitest'
import type { RecipientDelivery, ResultNoticeRecipient } from '@/features/recruitment/types'
import {
  countEmailCheckRecipients,
  formatRecipients,
  getDeliverySummary,
  getRecipientVariableValues,
  getTargetTitlePrefix,
} from './resultNoticeRecipient'

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

  it('면접 정보 안내면 면접 기간과 받는 사람의 면접 일시·장소도 채움', () => {
    const recipient = {
      ...createRecipient('1', { status: 'pending' }),
      interviewSchedule: { dateTime: '10/21 (수) 13:00', place: '학생회관 301호' },
    }

    expect(getRecipientVariableValues(recipient, '10/21 ~ 10/23')).toEqual({
      이름: '김모집',
      포지션: '디자인',
      '면접 기간': '10/21 ~ 10/23',
      '면접 일시': '10/21 (수) 13:00',
      '면접 장소': '학생회관 301호',
    })
    expect(getRecipientVariableValues(undefined, '10/21 ~ 10/23')).toEqual({
      '면접 기간': '10/21 ~ 10/23',
    })
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

describe('formatRecipients', () => {
  it('이름 · 이메일을 쉼표로 이어 표시', () => {
    const recipients = [
      createRecipient('1', { status: 'pending' }),
      createRecipient('2', { status: 'pending' }),
    ]

    expect(formatRecipients(recipients)).toBe(
      '김모집 · applicant1@example.com, 김모집 · applicant2@example.com',
    )
  })
})

describe('getTargetTitlePrefix', () => {
  it('한쪽만 보낼 때만 대상 이름을 붙임', () => {
    expect(getTargetTitlePrefix(['fail'])).toBe('불합격자 ')
    expect(getTargetTitlePrefix(['pass', 'fail'])).toBe('')
  })
})

describe('getDeliverySummary', () => {
  it('전체·발송·전달 인원과 실패한 받는 사람을 구분, 이메일 확인 필요 인원은 발송 인원에서 제외', () => {
    const failed = createRecipient('3', { status: 'failed', message: '메일 주소를 찾을 수 없어요' })
    const summary = getDeliverySummary([
      createRecipient('1', { status: 'delivered' }),
      createRecipient('2', { status: 'emailCheck', message: 'gmail.com이 맞나요?' }),
      failed,
    ])

    expect(summary).toEqual({
      totalCount: 3,
      sentCount: 2,
      deliveredCount: 1,
      failedRecipients: [failed],
    })
  })
})

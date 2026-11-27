import { describe, expect, it } from 'vitest'
import type { RecipientDelivery, ResultNoticeRecipient } from '@/features/recruitment/types'
import type { ResultMessageRecipientFieldsFragment } from '@/gql/graphql'
import {
  countEmailCheckRecipients,
  formatRecipients,
  getDeliverySummary,
  getRecipientVariableValues,
  getTargetTitlePrefix,
  toResultNoticeRecipient,
} from './resultNoticeRecipient'

function createRecipient(id: string, delivery: RecipientDelivery): ResultNoticeRecipient {
  return {
    id,
    name: '김모집',
    position: '디자인',
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

  it('포지션 없는 모집과 장소 없는 면접 칸은 해당 변수를 비워 둠', () => {
    const recipient = {
      ...createRecipient('1', { status: 'pending' }),
      position: null,
      interviewSchedule: { dateTime: '10/21 (수) 13:00', place: null },
    }

    expect(getRecipientVariableValues(recipient)).toEqual({
      이름: '김모집',
      '면접 일시': '10/21 (수) 13:00',
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

  it('이메일이 없으면 이름만 표시', () => {
    const recipient = {
      ...createRecipient('1', { status: 'emailCheck', message: '' }),
      email: null,
    }

    expect(formatRecipients([recipient])).toBe('김모집')
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

function createServerRecipient(
  fields: Partial<ResultMessageRecipientFieldsFragment> = {},
): ResultMessageRecipientFieldsFragment {
  return {
    application: { id: 'application-1', user: { name: '김모집' }, position: { name: '디자인' } },
    email: 'applicant1@example.com',
    emailWarning: null,
    suggestedDomain: null,
    interview: null,
    delivery: null,
    ...fields,
  }
}

describe('toResultNoticeRecipient', () => {
  it('지원서 ID·이름·포지션 이름·이메일을 옮기고, 보내기 전이면 상태 없음', () => {
    expect(toResultNoticeRecipient(createServerRecipient())).toEqual({
      id: 'application-1',
      name: '김모집',
      position: '디자인',
      email: 'applicant1@example.com',
      delivery: { status: 'pending' },
    })
  })

  it('포지션 없는 모집은 포지션 null', () => {
    const recipient = createServerRecipient({
      application: { id: 'application-1', user: { name: '김모집' }, position: null },
    })

    expect(toResultNoticeRecipient(recipient).position).toBeNull()
  })

  it('이메일 경고는 확인 필요로 표시하고 추천 도메인이 있으면 문구에 넣음', () => {
    const suspicious = createServerRecipient({
      email: 'applicant1@gmal.com',
      emailWarning: 'SUSPICIOUS_DOMAIN',
      suggestedDomain: 'gmail.com',
    })
    const missing = createServerRecipient({ email: null, emailWarning: 'MISSING' })

    expect(toResultNoticeRecipient(suspicious).delivery).toEqual({
      status: 'emailCheck',
      message: 'gmail.com이 맞나요?',
    })
    expect(toResultNoticeRecipient(missing)).toMatchObject({
      email: null,
      delivery: { status: 'emailCheck' },
    })
  })

  it('발송 결과는 진행 중이면 상태 없음, 성공이면 전달, 실패면 사유와 함께 실패', () => {
    function deliveryOf(delivery: ResultMessageRecipientFieldsFragment['delivery']) {
      return toResultNoticeRecipient(createServerRecipient({ delivery })).delivery
    }

    expect(deliveryOf({ status: 'PENDING', failReason: null })).toEqual({ status: 'pending' })
    expect(deliveryOf({ status: 'SUCCESS', failReason: null })).toEqual({ status: 'delivered' })
    expect(deliveryOf({ status: 'FAILED', failReason: '메일 주소를 찾을 수 없어요' })).toEqual({
      status: 'failed',
      message: '메일 주소를 찾을 수 없어요',
    })
  })

  it('배정된 면접 칸은 일시 문구와 장소로 바꿈', () => {
    const startAt = new Date(2026, 9, 21, 13, 0).toISOString()
    const recipient = createServerRecipient({ interview: { startAt, location: '학생회관 301호' } })

    expect(toResultNoticeRecipient(recipient).interviewSchedule).toEqual({
      dateTime: '10/21 (수) 13:00',
      place: '학생회관 301호',
    })
  })
})

import { describe, expect, it } from 'vitest'
import type { ResultNoticeMessage } from '@/features/recruitment/types'
import { getResultNoticeSendState } from './resultNoticeSendState'

const FILLED: ResultNoticeMessage = { subject: '서류 결과 안내', body: '안녕하세요.' }
const EMPTY: ResultNoticeMessage = { subject: '', body: '' }

describe('getResultNoticeSendState', () => {
  it('불합격 메시지 확인 전이면 지금 탭이 비어 있어도 확인 안내, 지금 탭 발송만 막음', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: false,
        messages: { pass: EMPTY, fail: EMPTY },
      }),
    ).toEqual({ type: 'reviewPending', canSendCurrent: false })
  })

  it('불합격 메시지 확인 후 지금 탭이 비어 있으면 지금 탭 기준 필수 입력 안내', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: EMPTY, fail: FILLED },
      }),
    ).toEqual({ type: 'missingInput', target: 'pass', missingField: 'both' })
  })

  it('빈 칸 종류를 제목·본문·둘 다로 구분하고 공백만 있으면 빈 값', () => {
    const stateOf = (message: ResultNoticeMessage) =>
      getResultNoticeSendState({
        currentTarget: 'fail',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail: message },
      })

    expect(stateOf({ subject: '  ', body: '본문' })).toMatchObject({ missingField: 'subject' })
    expect(stateOf({ subject: '제목', body: '' })).toMatchObject({ missingField: 'body' })
    expect(stateOf({ subject: ' ', body: '\n' })).toMatchObject({ missingField: 'both' })
  })

  it('지금 탭을 채웠고 불합격 메시지를 확인하기 전이면 확인 안내, 지금 탭 발송 가능', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: false,
        messages: { pass: FILLED, fail: EMPTY },
      }),
    ).toEqual({ type: 'reviewPending', canSendCurrent: true })
  })

  it('불합격 메시지 확인 후 다른 탭이 비어 있으면 그 탭 기준 필수 입력 안내', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail: { subject: '', body: '본문' } },
      }),
    ).toEqual({ type: 'missingInput', target: 'fail', missingField: 'subject' })
  })

  it('두 탭 모두 채우고 확인했으면 발송 가능', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'fail',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail: FILLED },
      }),
    ).toEqual({ type: 'ready' })
  })

  it('불합격자가 없으면 불합격 확인·입력 없이 합격 메시지만 확인', () => {
    const stateOf = (pass: ResultNoticeMessage) =>
      getResultNoticeSendState({
        currentTarget: 'fail',
        hasFailRecipients: false,
        hasReviewedFailMessage: false,
        messages: { pass, fail: EMPTY },
      })

    expect(stateOf(FILLED)).toEqual({ type: 'allPassed', missingField: null })
    expect(stateOf({ subject: '', body: '본문' })).toEqual({
      type: 'allPassed',
      missingField: 'subject',
    })
  })
})

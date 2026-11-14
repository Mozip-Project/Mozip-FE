import { describe, expect, it } from 'vitest'
import type {
  ResultNoticeMessage,
  ResultNoticeRecipient,
  ResultNoticeTarget,
} from '@/features/recruitment/types'
import { getPendingTargets, getResultNoticeSendState } from './resultNoticeSendState'

const FILLED: ResultNoticeMessage = { subject: '서류 결과 안내', body: '안녕하세요.' }
const EMPTY: ResultNoticeMessage = { subject: '', body: '' }
const NOT_SENT = { isSending: false, sentTargets: [] }

describe('getResultNoticeSendState', () => {
  it('불합격 메시지 확인 전이면 지금 탭이 비어 있어도 확인 안내, 지금 탭 발송만 막음', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: false,
        messages: { pass: EMPTY, fail: EMPTY },
        ...NOT_SENT,
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
        ...NOT_SENT,
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
        ...NOT_SENT,
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
        ...NOT_SENT,
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
        ...NOT_SENT,
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
        ...NOT_SENT,
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
        ...NOT_SENT,
      })

    expect(stateOf(FILLED)).toEqual({ type: 'allPassed', missingField: null })
    expect(stateOf({ subject: '', body: '본문' })).toEqual({
      type: 'allPassed',
      missingField: 'subject',
    })
  })

  it('발송 중이면 입력 상태와 관계없이 발송 중', () => {
    expect(
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail: FILLED },
        isSending: true,
        sentTargets: [],
      }),
    ).toEqual({ type: 'sending' })
  })

  it('한쪽만 발송했으면 남은 탭과 남은 탭 메시지 입력 여부 반환', () => {
    const stateOf = (fail: ResultNoticeMessage) =>
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients: true,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail },
        isSending: false,
        sentTargets: ['pass'],
      })

    expect(stateOf(FILLED)).toEqual({
      type: 'partiallySent',
      unsentTarget: 'fail',
      canSendUnsent: true,
    })
    expect(stateOf(EMPTY)).toMatchObject({ canSendUnsent: false })
  })

  it('발송 대상을 모두 보냈으면 모두 발송, 불합격자가 없으면 합격자만 보내도 모두 발송', () => {
    const stateOf = (hasFailRecipients: boolean, sentTargets: readonly ResultNoticeTarget[]) =>
      getResultNoticeSendState({
        currentTarget: 'pass',
        hasFailRecipients,
        hasReviewedFailMessage: true,
        messages: { pass: FILLED, fail: FILLED },
        isSending: false,
        sentTargets,
      })

    expect(stateOf(true, ['pass', 'fail'])).toEqual({ type: 'allSent' })
    expect(stateOf(false, ['pass'])).toEqual({ type: 'allSent' })
  })
})

const FAILED_RECIPIENT: ResultNoticeRecipient = {
  id: 'f1',
  name: '지원자f1',
  position: 'design',
  email: 'f1@example.com',
  delivery: { status: 'failed', message: '전달 실패' },
}
const NO_FAILED = { pass: [], fail: [] }

describe('getPendingTargets', () => {
  it('불합격 메시지 확인 전이면 다른 탭의 불합격자 탭 표시, 보고 있는 탭과 확인 후에는 숨김', () => {
    const pendingOf = (currentTarget: ResultNoticeTarget, hasReviewedFailMessage: boolean) =>
      getPendingTargets({
        currentTarget,
        recipientCounts: { pass: 2, fail: 2 },
        hasReviewedFailMessage,
        sentTargets: [],
        failedRecipientsByTarget: NO_FAILED,
      })

    expect(pendingOf('pass', false)).toEqual(['fail'])
    expect(pendingOf('fail', false)).toEqual([])
    expect(pendingOf('pass', true)).toEqual([])
  })

  it('불합격자가 없으면 불합격 메시지 미확인을 할 일로 보지 않음', () => {
    expect(
      getPendingTargets({
        currentTarget: 'pass',
        recipientCounts: { pass: 2, fail: 0 },
        hasReviewedFailMessage: false,
        sentTargets: [],
        failedRecipientsByTarget: NO_FAILED,
      }),
    ).toEqual([])
  })

  it('한쪽만 보냈으면 남은 탭 표시, 받는 사람이 없는 탭은 제외', () => {
    const pendingOf = (recipientCounts: Record<ResultNoticeTarget, number>) =>
      getPendingTargets({
        currentTarget: 'fail',
        recipientCounts,
        hasReviewedFailMessage: true,
        sentTargets: ['fail'],
        failedRecipientsByTarget: NO_FAILED,
      })

    expect(pendingOf({ pass: 2, fail: 2 })).toEqual(['pass'])
    expect(pendingOf({ pass: 0, fail: 2 })).toEqual([])
  })

  it('전달 실패가 있는 탭은 보낸 뒤에도 표시', () => {
    expect(
      getPendingTargets({
        currentTarget: 'pass',
        recipientCounts: { pass: 2, fail: 2 },
        hasReviewedFailMessage: true,
        sentTargets: ['pass', 'fail'],
        failedRecipientsByTarget: { pass: [], fail: [FAILED_RECIPIENT] },
      }),
    ).toEqual(['fail'])
  })
})

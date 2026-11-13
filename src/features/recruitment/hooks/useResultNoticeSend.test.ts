import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SEND_FAILED_SAMPLE } from '@/features/recruitment/mocks/resultNoticeSample'
import type {
  RecipientDelivery,
  ResultNoticeMessage,
  ResultNoticeRecipient,
  ResultNoticeTarget,
} from '@/features/recruitment/types'
import {
  MOCK_SEND_INTERVAL_MS,
  useResultNoticeSend,
  type ResultNoticeRecipients,
} from './useResultNoticeSend'

function createRecipient(
  id: string,
  delivery: RecipientDelivery = { status: 'pending' },
): ResultNoticeRecipient {
  return { id, name: `지원자${id}`, position: 'design', email: `a${id}@example.com`, delivery }
}

const EMAIL_CHECK: RecipientDelivery = { status: 'emailCheck', message: '주소 확인' }

// 합격 2명 중 1명은 이메일 확인 필요, 불합격 2명 중 1명은 전달 실패 샘플
const RECIPIENTS: ResultNoticeRecipients = {
  pass: [createRecipient('p1'), createRecipient('p2', EMAIL_CHECK)],
  fail: [createRecipient('f1'), createRecipient(SEND_FAILED_SAMPLE.applicantId)],
}

const MESSAGES = {
  pass: { subject: '합격 안내', body: '합격 본문' },
  fail: { subject: '불합격 안내', body: '불합격 본문' },
} satisfies Record<ResultNoticeTarget, ResultNoticeMessage>

function renderSendHook() {
  return renderHook(() => useResultNoticeSend(RECIPIENTS))
}

function advanceSend(count: number) {
  act(() => {
    vi.advanceTimersByTime(MOCK_SEND_INTERVAL_MS * count)
  })
}

function deliveryStatusesOf(recipients: readonly ResultNoticeRecipient[] | undefined) {
  return recipients?.map(({ delivery }) => delivery.status)
}

describe('useResultNoticeSend', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('확인 후 이메일 확인 필요 인원을 뺀 인원으로 발송 중, 끝나면 결과 창과 받는 사람별 전달 상태', () => {
    const { result } = renderSendHook()

    act(() => result.current.openConfirm(['pass', 'fail']))
    act(() => result.current.startSend(MESSAGES))

    expect(result.current.dialog).toEqual({ phase: 'sending', targets: ['pass', 'fail'] })
    expect(result.current.progress).toEqual({ sentCount: 0, totalCount: 3 })

    advanceSend(2)
    expect(result.current.progress).toEqual({ sentCount: 2, totalCount: 3 })

    advanceSend(1)
    expect(result.current.progress).toBeNull()
    expect(result.current.dialog).toEqual({ phase: 'result', targets: ['pass', 'fail'] })
    expect(deliveryStatusesOf(result.current.results.pass?.recipients)).toEqual([
      'delivered',
      'emailCheck',
    ])
    expect(deliveryStatusesOf(result.current.results.fail?.recipients)).toEqual([
      'delivered',
      'failed',
    ])
  })

  it('발송 시점의 메시지를 결과에 보관', () => {
    const { result } = renderSendHook()

    act(() => result.current.openConfirm(['pass']))
    act(() => result.current.startSend(MESSAGES))
    advanceSend(1)

    expect(result.current.results.pass?.message).toEqual(MESSAGES.pass)
  })

  it('발송 중 창을 닫으면 발송은 계속되고 끝나도 결과 창을 다시 열지 않음', () => {
    const { result } = renderSendHook()

    act(() => result.current.openConfirm(['fail']))
    act(() => result.current.startSend(MESSAGES))
    act(() => result.current.closeDialog())

    advanceSend(1)
    expect(result.current.progress).toEqual({ sentCount: 1, totalCount: 2 })

    advanceSend(1)
    expect(result.current.dialog).toBeNull()
    expect(result.current.results.fail).toBeDefined()
    expect(result.current.results.pass).toBeUndefined()
  })

  it('한쪽씩 보내면 앞서 보낸 결과를 유지', () => {
    const { result } = renderSendHook()

    act(() => result.current.openConfirm(['pass']))
    act(() => result.current.startSend(MESSAGES))
    advanceSend(1)

    act(() => result.current.openConfirm(['fail']))
    act(() => result.current.startSend(MESSAGES))
    advanceSend(2)

    expect(result.current.results.pass).toBeDefined()
    expect(result.current.results.fail).toBeDefined()
  })

  it('언마운트하면 진행 중인 발송 타이머 정리', () => {
    const { result, unmount } = renderSendHook()

    act(() => result.current.openConfirm(['pass', 'fail']))
    act(() => result.current.startSend(MESSAGES))
    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})

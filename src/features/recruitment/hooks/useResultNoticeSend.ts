import { useEffect, useRef, useState } from 'react'
import { SEND_FAILED_SAMPLE } from '@/features/recruitment/mocks/resultNoticeSample'
import {
  RESULT_NOTICE_TARGETS,
  type RecipientDelivery,
  type ResultNoticeMessage,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeTargetSendResult,
} from '@/features/recruitment/types'
import {
  getDeliverySummary,
  getSendableRecipients,
} from '@/features/recruitment/utils/resultNoticeRecipient'

// TODO: 발송 API 연결 후 발송 요청과 발송 결과 폴링으로 교체, 지금은 한 명씩 보내는 것처럼 표시
// TODO: 발송 API 연결 시 서버 오류(아무에게도 미발송)면 발송 중 창 닫고 '서류 결과를 발송하지 못했어요. 다시 시도해 주세요.' 토스트
const MOCK_SEND_INTERVAL_MS = 60

type ResultNoticeSendDialogState = {
  phase: 'confirm' | 'sending' | 'result'
  targets: readonly ResultNoticeTarget[]
}

type ResultNoticeSendProgress = {
  sentCount: number
  totalCount: number
}

type ResultNoticeRecipients = Record<ResultNoticeTarget, readonly ResultNoticeRecipient[]>

// 보낸 대상만 결과가 있음
type ResultNoticeSendResults = Partial<Record<ResultNoticeTarget, ResultNoticeTargetSendResult>>

type FailedRecipientsByTarget = Record<ResultNoticeTarget, ResultNoticeRecipient[]>

// 이메일 확인 필요 인원은 보내지 않아 상태 유지
function getMockDelivery({ id, delivery }: ResultNoticeRecipient): RecipientDelivery {
  if (delivery.status === 'emailCheck') {
    return delivery
  }

  if (id === SEND_FAILED_SAMPLE.applicantId) {
    return { status: 'failed', message: SEND_FAILED_SAMPLE.message }
  }

  return { status: 'delivered' }
}

function createMockSendResult(
  recipients: readonly ResultNoticeRecipient[],
  message: ResultNoticeMessage,
): ResultNoticeTargetSendResult {
  return {
    message,
    recipients: recipients.map((recipient) => ({
      ...recipient,
      delivery: getMockDelivery(recipient),
    })),
  }
}

function useResultNoticeSend(recipients: ResultNoticeRecipients) {
  const [dialog, setDialog] = useState<ResultNoticeSendDialogState | null>(null)
  const [progress, setProgress] = useState<ResultNoticeSendProgress | null>(null)
  const [results, setResults] = useState<ResultNoticeSendResults>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  function openConfirm(targets: readonly ResultNoticeTarget[]) {
    setDialog({ phase: 'confirm', targets })
  }

  function closeDialog() {
    setDialog(null)
  }

  function finishSend(
    targets: readonly ResultNoticeTarget[],
    messages: Record<ResultNoticeTarget, ResultNoticeMessage>,
  ) {
    setProgress(null)
    setResults((previous) => {
      const next = { ...previous }

      for (const target of targets) {
        next[target] = createMockSendResult(recipients[target], messages[target])
      }

      return next
    })
    // 발송 중 창을 닫았으면 결과 창을 다시 열지 않음
    setDialog((previous) =>
      previous?.phase === 'sending' ? { phase: 'result', targets } : previous,
    )
  }

  // 발송 시점의 메시지를 결과에 보관
  function startSend(messages: Record<ResultNoticeTarget, ResultNoticeMessage>) {
    if (dialog?.phase !== 'confirm' || timerRef.current !== null) {
      return
    }

    const { targets } = dialog
    const totalCount = targets.reduce(
      (count, target) => count + getSendableRecipients(recipients[target]).length,
      0,
    )

    setDialog({ phase: 'sending', targets })

    if (totalCount === 0) {
      finishSend(targets, messages)
      return
    }

    let sentCount = 0
    setProgress({ sentCount, totalCount })

    timerRef.current = setInterval(() => {
      sentCount += 1

      if (sentCount < totalCount) {
        setProgress({ sentCount, totalCount })
        return
      }

      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      finishSend(targets, messages)
    }, MOCK_SEND_INTERVAL_MS)
  }

  const sentTargets = RESULT_NOTICE_TARGETS.filter((target) => results[target] !== undefined)
  const failedRecipientsByTarget = {
    pass: getDeliverySummary(results.pass?.recipients ?? []).failedRecipients,
    fail: getDeliverySummary(results.fail?.recipients ?? []).failedRecipients,
  } satisfies FailedRecipientsByTarget

  return {
    dialog,
    progress,
    results,
    sentTargets,
    failedRecipientsByTarget,
    openConfirm,
    closeDialog,
    startSend,
  }
}

export { MOCK_SEND_INTERVAL_MS, useResultNoticeSend }
export type {
  FailedRecipientsByTarget,
  ResultNoticeRecipients,
  ResultNoticeSendDialogState,
  ResultNoticeSendProgress,
  ResultNoticeSendResults,
}

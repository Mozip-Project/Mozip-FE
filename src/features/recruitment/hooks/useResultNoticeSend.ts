import { useState } from 'react'
import {
  useResultMessageProgressQuery,
  useSendResultMessagesMutation,
} from '@/features/recruitment/api/organizer/queries'
import {
  MESSAGE_ALREADY_SENT_CODE,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeTargetSendResult,
} from '@/features/recruitment/types'
import { getDeliverySummary } from '@/features/recruitment/utils/resultNoticeRecipient'
import type { ResultMessagesFieldsFragment } from '@/gql/graphql'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'
import { isOneOf } from '@/utils/isOneOf'

const SEND_BLOCKED_CODE = 'MESSAGE_422'
const SEND_FAILED_TITLE = '서류 결과를 발송하지 못했어요. 다시 발송해 주세요.'

// TODO: 면접 변수 발송 불가 안내 디자이너 확인
const SEND_BLOCKED_TITLE = {
  TIMETABLE_NOT_CONFIRMED: '면접 타임테이블을 확정한 뒤 발송해 주세요.',
  INTERVIEW_NOT_ASSIGNED:
    '면접 시간이 배정되지 않은 합격자가 있어요. 타임테이블에서 배정하거나 면접 변수를 빼 주세요.',
}
const SEND_BLOCKED_REASONS = ['TIMETABLE_NOT_CONFIRMED', 'INTERVIEW_NOT_ASSIGNED'] as const

type ResultNoticeSendDialogState = {
  phase: 'confirm' | 'sending' | 'result'
  targets: readonly ResultNoticeTarget[]
}

type ResultNoticeSendProgress = {
  sentCount: number
  totalCount: number
}

type ResultNoticeRecipients = Record<ResultNoticeTarget, readonly ResultNoticeRecipient[]>

// 발송 시작한 대상만
type ResultNoticeSendResults = Partial<Record<ResultNoticeTarget, ResultNoticeTargetSendResult>>

type FailedRecipientsByTarget = Record<ResultNoticeTarget, ResultNoticeRecipient[]>

function getSendErrorTitle(error: unknown) {
  if (
    error instanceof ApiError &&
    error.code === SEND_BLOCKED_CODE &&
    error.reason &&
    isOneOf(SEND_BLOCKED_REASONS, error.reason)
  ) {
    return SEND_BLOCKED_TITLE[error.reason]
  }
  return SEND_FAILED_TITLE
}

type UseResultNoticeSendOptions = {
  postingId: string
  notice: ResultMessagesFieldsFragment
  recipients: ResultNoticeRecipients
  // 발송 전 초안 저장, 실패하면 false
  flushSave: () => Promise<boolean>
}

// 발송 상태는 서버 메시지 상태 기준
function useResultNoticeSend({
  postingId,
  notice,
  recipients,
  flushSave,
}: UseResultNoticeSendOptions) {
  const { showToast } = useToast()
  const { mutateAsync: sendMessages } = useSendResultMessagesMutation(postingId)
  const [dialogState, setDialogState] = useState<ResultNoticeSendDialogState | null>(null)
  // 초안 저장 ~ 발송 응답 사이
  const [isStarting, setIsStarting] = useState(false)

  const statuses = {
    pass: notice.pass.message?.status ?? null,
    fail: notice.fail.message?.status ?? null,
  }
  const sentTargets = RESULT_NOTICE_TARGETS.filter(
    (target) => statuses[target] === 'SENDING' || statuses[target] === 'SENT',
  )
  const sendingTargets = RESULT_NOTICE_TARGETS.filter((target) => statuses[target] === 'SENDING')
  const isSending = isStarting || sendingTargets.length > 0
  // 진행 수는 진행률 조회 값 우선
  const { data: sendProgress } = useResultMessageProgressQuery(postingId, sendingTargets.length > 0)

  // 발송 중 창이 열린 채 끝나면 결과 창
  const isDialogSendDone =
    dialogState?.phase === 'sending' &&
    !isStarting &&
    dialogState.targets.every((target) => statuses[target] === 'SENT')
  const dialog: ResultNoticeSendDialogState | null = isDialogSendDone
    ? { phase: 'result', targets: dialogState.targets }
    : dialogState

  const progressTargets = dialog?.phase === 'sending' ? dialog.targets : sendingTargets
  const progress: ResultNoticeSendProgress | null = isSending
    ? {
        sentCount: progressTargets.reduce(
          (sum, target) =>
            sum + (sendProgress?.[target].processedCount ?? notice[target].processedCount),
          0,
        ),
        totalCount: progressTargets.reduce((sum, target) => sum + notice[target].sendableCount, 0),
      }
    : null

  const results: ResultNoticeSendResults = {}
  for (const target of sentTargets) {
    const message = notice[target].message
    if (message) {
      const sendingDeliveredCount = sendProgress?.[target].deliveredCount
      results[target] = {
        message: { subject: message.subject, body: message.body },
        recipients: [...recipients[target]],
        ...(statuses[target] === 'SENDING' && { sendingDeliveredCount }),
      }
    }
  }

  const failedRecipientsByTarget = {
    pass: getDeliverySummary(results.pass?.recipients ?? []).failedRecipients,
    fail: getDeliverySummary(results.fail?.recipients ?? []).failedRecipients,
  } satisfies FailedRecipientsByTarget

  function openConfirm(targets: readonly ResultNoticeTarget[]) {
    setDialogState({ phase: 'confirm', targets })
  }

  function closeDialog() {
    setDialogState(null)
  }

  // 남은 초안 저장 후 발송, 이미 발송(409)이면 안내 생략
  async function startSend() {
    if (dialogState?.phase !== 'confirm' || isStarting) {
      return
    }

    const { targets } = dialogState
    setDialogState({ phase: 'sending', targets })
    setIsStarting(true)
    try {
      if (!(await flushSave())) {
        throw new Error('초안을 저장하지 못했습니다.')
      }
      await sendMessages(targets)
    } catch (error) {
      setDialogState(null)
      if (!(error instanceof ApiError && error.code === MESSAGE_ALREADY_SENT_CODE)) {
        showToast({ title: getSendErrorTitle(error), icon: 'alert' })
      }
    } finally {
      setIsStarting(false)
    }
  }

  return {
    dialog,
    progress,
    results,
    isSending,
    sentTargets,
    failedRecipientsByTarget,
    openConfirm,
    closeDialog,
    startSend,
  }
}

export { useResultNoticeSend }
export type {
  FailedRecipientsByTarget,
  ResultNoticeRecipients,
  ResultNoticeSendDialogState,
  ResultNoticeSendProgress,
  ResultNoticeSendResults,
}

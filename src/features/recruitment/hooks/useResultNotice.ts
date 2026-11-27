import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { RecipientFocusRequest } from '@/features/recruitment/components/organizer/resultNotice/recipientTable'
import {
  resultNoticeFormSchema,
  type ResultNoticeFormValues,
} from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import type { ResultNoticeTarget } from '@/features/recruitment/types'
import {
  getPendingTargets,
  getResultNoticeSendState,
} from '@/features/recruitment/utils/resultNoticeSendState'
import type { ResultMessagesFieldsFragment } from '@/gql/graphql'
import { useResultNoticeMessageSave } from './useResultNoticeMessageSave'
import { useResultNoticeSend, type ResultNoticeRecipients } from './useResultNoticeSend'

// 초안이 없으면 빈 칸
function getSavedMessage(message: { subject: string; body: string } | null) {
  return { subject: message?.subject ?? '', body: message?.body ?? '' }
}

type UseResultNoticeOptions = {
  postingId: string
  notice: ResultMessagesFieldsFragment
  recipients: ResultNoticeRecipients
}

// 결과 안내 탭·작성·발송 상태
function useResultNotice({ postingId, notice, recipients }: UseResultNoticeOptions) {
  const [currentTarget, setCurrentTarget] = useState<ResultNoticeTarget>('pass')
  const [failedRowFocusRequest, setFailedRowFocusRequest] = useState<RecipientFocusRequest>()
  // TODO: 메시지 확인 저장 방식 백엔드 확인, 지금은 화면에서만 기억
  const [hasOpenedFailTab, setHasOpenedFailTab] = useState(false)

  const form = useForm<ResultNoticeFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(resultNoticeFormSchema),
    defaultValues: {
      pass: getSavedMessage(notice.pass.message),
      fail: getSavedMessage(notice.fail.message),
    },
  })
  const [passMessage, failMessage] = useWatch({ control: form.control, name: ['pass', 'fail'] })
  const { flushSave } = useResultNoticeMessageSave({
    postingId,
    form,
    messageStatuses: {
      pass: notice.pass.message?.status ?? null,
      fail: notice.fail.message?.status ?? null,
    },
  })
  const sendFlow = useResultNoticeSend({ postingId, notice, recipients, flushSave })

  const recipientCounts = {
    pass: notice.pass.recipientCount,
    fail: notice.fail.recipientCount,
  } satisfies Record<ResultNoticeTarget, number>
  const sendCounts = {
    pass: notice.pass.sendableCount,
    fail: notice.fail.sendableCount,
  } satisfies Record<ResultNoticeTarget, number>
  const hasFailRecipients = recipientCounts.fail > 0
  const hasReviewedFailMessage = hasOpenedFailTab || notice.fail.message !== null

  const sendState = getResultNoticeSendState({
    currentTarget,
    hasFailRecipients,
    hasReviewedFailMessage,
    messages: { pass: passMessage, fail: failMessage },
    isSending: sendFlow.isSending,
    sentTargets: sendFlow.sentTargets,
  })

  const pendingTargets = getPendingTargets({
    currentTarget,
    recipientCounts,
    hasReviewedFailMessage,
    sentTargets: sendFlow.sentTargets,
    failedRecipientsByTarget: sendFlow.failedRecipientsByTarget,
  })

  // 탭 이동 시 발송 창 닫기, 불합격자 탭이면 메시지 확인 처리
  function selectTarget(target: ResultNoticeTarget) {
    sendFlow.closeDialog()
    setCurrentTarget(target)
    setFailedRowFocusRequest(undefined)

    if (target === 'fail') {
      setHasOpenedFailTab(true)
    }
  }

  // 실패 탭으로 이동해 첫 실패 행으로 스크롤
  function showFailedRecipient(target: ResultNoticeTarget) {
    const [firstFailedRecipient] = sendFlow.failedRecipientsByTarget[target]

    selectTarget(target)
    if (firstFailedRecipient) {
      setFailedRowFocusRequest({ recipientId: firstFailedRecipient.id })
    }
  }

  // 빈 칸으로 초기화
  function resetMessage(target: ResultNoticeTarget) {
    form.resetField(`${target}.subject`, { defaultValue: '' })
    form.resetField(`${target}.body`, { defaultValue: '' })
  }

  return {
    control: form.control,
    currentTarget,
    recipientCounts,
    sendCounts,
    hasFailRecipients,
    sendState,
    pendingTargets,
    failedRowFocusRequest,
    sendFlow,
    selectTarget,
    showFailedRecipient,
    resetMessage,
  }
}

export { useResultNotice }

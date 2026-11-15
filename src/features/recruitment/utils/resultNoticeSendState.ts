import { isFilled } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  RESULT_NOTICE_TARGETS,
  type ResultNoticeMessage,
  type ResultNoticeMissingField,
  type ResultNoticeRecipient,
  type ResultNoticeSendState,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'

const OTHER_TARGET = {
  pass: 'fail',
  fail: 'pass',
} satisfies Record<ResultNoticeTarget, ResultNoticeTarget>

function getMissingField({ subject, body }: ResultNoticeMessage): ResultNoticeMissingField | null {
  const isSubjectFilled = isFilled(subject)
  const isBodyFilled = isFilled(body)

  if (isSubjectFilled && isBodyFilled) {
    return null
  }

  if (!isSubjectFilled && !isBodyFilled) {
    return 'both'
  }

  return isSubjectFilled ? 'body' : 'subject'
}

type ResultNoticeSendStateInput = {
  currentTarget: ResultNoticeTarget
  hasFailRecipients: boolean
  hasReviewedFailMessage: boolean
  messages: Record<ResultNoticeTarget, ResultNoticeMessage>
  isSending: boolean
  sentTargets: readonly ResultNoticeTarget[]
}

// 발송 중·발송 결과를 먼저, 발송 전이면 불합격 메시지 확인 안내 다음 빈 칸 안내는 지금 탭부터
function getResultNoticeSendState({
  currentTarget,
  hasFailRecipients,
  hasReviewedFailMessage,
  messages,
  isSending,
  sentTargets,
}: ResultNoticeSendStateInput): ResultNoticeSendState {
  if (isSending) {
    return { type: 'sending' }
  }

  // 불합격자가 없으면 합격자만 발송 대상
  const requiredTargets = hasFailRecipients ? RESULT_NOTICE_TARGETS : (['pass'] as const)
  const unsentTargets = requiredTargets.filter((target) => !sentTargets.includes(target))
  const [unsentTarget] = unsentTargets

  if (!unsentTarget) {
    return { type: 'allSent' }
  }

  if (unsentTargets.length < requiredTargets.length) {
    return {
      type: 'partiallySent',
      unsentTarget,
      canSendUnsent: getMissingField(messages[unsentTarget]) === null,
    }
  }

  // 불합격자가 없으면 불합격 메시지 확인, 입력 없이 합격 메시지만 확인
  if (!hasFailRecipients) {
    return { type: 'allPassed', missingField: getMissingField(messages.pass) }
  }

  const currentMissingField = getMissingField(messages[currentTarget])

  if (!hasReviewedFailMessage) {
    return { type: 'reviewPending', canSendCurrent: currentMissingField === null }
  }

  if (currentMissingField) {
    return { type: 'missingInput', target: currentTarget, missingField: currentMissingField }
  }

  const otherTarget = OTHER_TARGET[currentTarget]
  const otherMissingField = getMissingField(messages[otherTarget])

  if (otherMissingField) {
    return { type: 'missingInput', target: otherTarget, missingField: otherMissingField }
  }

  return { type: 'ready' }
}

type PendingTargetsInput = {
  currentTarget: ResultNoticeTarget
  recipientCounts: Record<ResultNoticeTarget, number>
  hasReviewedFailMessage: boolean
  sentTargets: readonly ResultNoticeTarget[]
  failedRecipientsByTarget: Record<ResultNoticeTarget, readonly ResultNoticeRecipient[]>
}

// 탭 빨간 점 대상: 보고 있지 않은 탭 중 불합격 메시지 미확인, 한쪽만 보낸 뒤 남은 탭, 전달 실패
function getPendingTargets({
  currentTarget,
  recipientCounts,
  hasReviewedFailMessage,
  sentTargets,
  failedRecipientsByTarget,
}: PendingTargetsInput): ResultNoticeTarget[] {
  function hasTodo(target: ResultNoticeTarget) {
    const isFailMessageUnreviewed =
      target === 'fail' && recipientCounts.fail > 0 && !hasReviewedFailMessage
    const isLeftUnsent =
      sentTargets.length > 0 && !sentTargets.includes(target) && recipientCounts[target] > 0

    return isFailMessageUnreviewed || isLeftUnsent || failedRecipientsByTarget[target].length > 0
  }

  return RESULT_NOTICE_TARGETS.filter((target) => target !== currentTarget && hasTodo(target))
}

export { getPendingTargets, getResultNoticeSendState }

import { isFilled } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import type {
  ResultNoticeMessage,
  ResultNoticeMissingField,
  ResultNoticeSendState,
  ResultNoticeTarget,
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
}

// TODO: 발송 연결 후 발송 상태 추가
// 불합격 메시지 확인 전이면 확인 안내를 먼저, 그다음 빈 칸 안내는 지금 탭부터
function getResultNoticeSendState({
  currentTarget,
  hasFailRecipients,
  hasReviewedFailMessage,
  messages,
}: ResultNoticeSendStateInput): ResultNoticeSendState {
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

export { getResultNoticeSendState }

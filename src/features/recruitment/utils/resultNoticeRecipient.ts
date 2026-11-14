import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  type ResultNoticeRecipient,
  type ResultNoticeVariableValues,
} from '@/features/recruitment/types'

// 받는 사람이 없으면 미리보기에 `{변수}` 그대로 표시
function getRecipientVariableValues(
  recipient: ResultNoticeRecipient | undefined,
): ResultNoticeVariableValues {
  if (!recipient) {
    return {}
  }

  return { 이름: recipient.name, 포지션: DOCUMENT_REVIEW_POSITION_LABEL[recipient.position] }
}

// 이메일 확인 필요 인원은 수정 없이 빼고 발송
function countEmailCheckRecipients(recipients: readonly ResultNoticeRecipient[]) {
  return recipients.filter((recipient) => recipient.delivery.status === 'emailCheck').length
}

export { countEmailCheckRecipients, getRecipientVariableValues }

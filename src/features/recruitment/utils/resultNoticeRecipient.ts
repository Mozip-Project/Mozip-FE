import {
  DOCUMENT_REVIEW_POSITION_LABEL,
  RESULT_NOTICE_TARGET_LABEL,
  type ResultNoticeDeliverySummary,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeVariableValues,
} from '@/features/recruitment/types'

// 값이 없는 변수는 미리보기에 `{변수}` 그대로 표시
function getRecipientVariableValues(
  recipient: ResultNoticeRecipient | undefined,
  interviewPeriod?: string,
): ResultNoticeVariableValues {
  const periodValues = interviewPeriod ? { '면접 기간': interviewPeriod } : {}

  if (!recipient) {
    return periodValues
  }

  const scheduleValues = recipient.interviewSchedule
    ? {
        '면접 일시': recipient.interviewSchedule.dateTime,
        '면접 장소': recipient.interviewSchedule.place,
      }
    : {}

  return {
    이름: recipient.name,
    포지션: DOCUMENT_REVIEW_POSITION_LABEL[recipient.position],
    ...periodValues,
    ...scheduleValues,
  }
}

function isEmailCheckRecipient(recipient: ResultNoticeRecipient) {
  return recipient.delivery.status === 'emailCheck'
}

// 이메일 확인 필요 인원은 수정 없이 빼고 발송
function countEmailCheckRecipients(recipients: readonly ResultNoticeRecipient[]) {
  return recipients.filter(isEmailCheckRecipient).length
}

function getEmailCheckRecipients(recipients: readonly ResultNoticeRecipient[]) {
  return recipients.filter(isEmailCheckRecipient)
}

function getSendableRecipients(recipients: readonly ResultNoticeRecipient[]) {
  return recipients.filter((recipient) => !isEmailCheckRecipient(recipient))
}

function getDeliverySummary(
  recipients: readonly ResultNoticeRecipient[],
): ResultNoticeDeliverySummary {
  return {
    totalCount: recipients.length,
    sentCount: getSendableRecipients(recipients).length,
    deliveredCount: recipients.filter(({ delivery }) => delivery.status === 'delivered').length,
    failedRecipients: recipients.filter(({ delivery }) => delivery.status === 'failed'),
  }
}

// 발송 안내 박스용 '이름 · 이메일' 목록
function formatRecipients(recipients: readonly ResultNoticeRecipient[]) {
  return recipients.map(({ name, email }) => `${name} · ${email}`).join(', ')
}

// 한쪽만 보낼 때는 발송 창 제목에 대상 표시
function getTargetTitlePrefix(targets: readonly ResultNoticeTarget[]) {
  const [target] = targets
  return targets.length === 1 && target ? `${RESULT_NOTICE_TARGET_LABEL[target]} ` : ''
}

export {
  countEmailCheckRecipients,
  formatRecipients,
  getDeliverySummary,
  getEmailCheckRecipients,
  getRecipientVariableValues,
  getSendableRecipients,
  getTargetTitlePrefix,
}

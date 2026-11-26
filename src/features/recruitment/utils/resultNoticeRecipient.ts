import {
  RESULT_NOTICE_TARGET_LABEL,
  type RecipientDelivery,
  type ResultNoticeDeliverySummary,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeVariableValues,
} from '@/features/recruitment/types'
import type { EmailWarning, ResultMessageRecipientFieldsFragment } from '@/gql/graphql'
import { formatDateTimeWithWeekday } from '@/utils/date'

// TODO: 주소 없음·추천 도메인 없는 경고 문구 디자이너 확인, Figma엔 'gmail.com이 맞나요?'만 있음
const MISSING_EMAIL_MESSAGE = '연락 이메일이 없어요'
const SUSPICIOUS_EMAIL_MESSAGE = '이메일 주소를 확인해 주세요'

// 값이 없는 변수는 미리보기에 `{변수}` 그대로 표시
function getRecipientVariableValues(
  recipient: ResultNoticeRecipient | undefined,
  interviewPeriod?: string,
): ResultNoticeVariableValues {
  const periodValues = interviewPeriod ? { '면접 기간': interviewPeriod } : {}

  if (!recipient) {
    return periodValues
  }

  const { interviewSchedule, position } = recipient

  return {
    이름: recipient.name,
    ...(position && { 포지션: position }),
    ...periodValues,
    ...(interviewSchedule && { '면접 일시': interviewSchedule.dateTime }),
    ...(interviewSchedule?.place && { '면접 장소': interviewSchedule.place }),
  }
}

function getEmailWarningMessage(warning: EmailWarning, suggestedDomain: string | null) {
  switch (warning) {
    case 'MISSING':
      return MISSING_EMAIL_MESSAGE
    case 'SUSPICIOUS_DOMAIN':
      return suggestedDomain ? `${suggestedDomain}이 맞나요?` : SUSPICIOUS_EMAIL_MESSAGE
  }
}

// 이메일 경고가 있으면 발송에서 빠져 전달 결과보다 경고를 표시
function toRecipientDelivery({
  emailWarning,
  suggestedDomain,
  delivery,
}: ResultMessageRecipientFieldsFragment): RecipientDelivery {
  if (emailWarning) {
    return { status: 'emailCheck', message: getEmailWarningMessage(emailWarning, suggestedDomain) }
  }
  if (!delivery) {
    return { status: 'pending' }
  }

  switch (delivery.status) {
    case 'PENDING':
      return { status: 'pending' }
    case 'SUCCESS':
      return { status: 'delivered' }
    case 'FAILED':
      return { status: 'failed', message: delivery.failReason ?? '' }
  }
}

function toResultNoticeRecipient(
  recipient: ResultMessageRecipientFieldsFragment,
): ResultNoticeRecipient {
  const { application, email, interview } = recipient

  return {
    id: application.id,
    name: application.user.name,
    position: application.position?.name ?? null,
    email,
    delivery: toRecipientDelivery(recipient),
    ...(interview && {
      interviewSchedule: {
        dateTime: formatDateTimeWithWeekday(new Date(interview.startAt)),
        place: interview.location,
      },
    }),
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
  return recipients.map(({ name, email }) => (email ? `${name} · ${email}` : name)).join(', ')
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
  toResultNoticeRecipient,
}

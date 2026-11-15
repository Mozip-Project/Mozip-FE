'use client'

import { useController, type Control } from 'react-hook-form'
import { Badge } from '@/components/ui/Badge/badge'
import type { ResultNoticeFormValues } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  RESULT_NOTICE_TARGET_LABEL,
  type ResultNoticeDeliverySummary,
  type ResultNoticeKind,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeTargetSendResult,
  type ResultNoticeVariable,
} from '@/features/recruitment/types'
import {
  countEmailCheckRecipients,
  getDeliverySummary,
  getRecipientVariableValues,
} from '@/features/recruitment/utils/resultNoticeRecipient'
import { cn } from '@/lib/utils'
import { MessageEditor } from './messageEditor'
import { MessagePreview } from './messagePreview'
import { RecipientTable, type RecipientFocusRequest } from './recipientTable'
import { SentMessageCard } from './sentMessageCard'

const MESSAGE_TITLE = {
  pass: '합격 안내 메시지',
  fail: '불합격 안내 메시지',
} satisfies Record<ResultNoticeTarget, string>

const DOCUMENT_NOTICE_VARIABLES = [
  '이름',
  '포지션',
] as const satisfies readonly ResultNoticeVariable[]

const INTERVIEW_NOTICE_VARIABLES = [
  ...DOCUMENT_NOTICE_VARIABLES,
  '면접 기간',
  '면접 일시',
  '면접 장소',
] as const satisfies readonly ResultNoticeVariable[]

// 면접 정보는 타임테이블 대상인 합격자 메시지에만
function getNoticeVariables(kind: ResultNoticeKind, target: ResultNoticeTarget) {
  return kind === 'interview' && target === 'pass'
    ? INTERVIEW_NOTICE_VARIABLES
    : DOCUMENT_NOTICE_VARIABLES
}

type ResultNoticePanelProps = {
  kind: ResultNoticeKind
  target: ResultNoticeTarget
  organizationName: string
  interviewPeriod?: string
  recipients: readonly ResultNoticeRecipient[]
  control: Control<ResultNoticeFormValues>
  onMessageReset: () => void
  // 발송한 탭은 작성 대신 발송한 메시지와 전달 결과 표시
  sendResult?: ResultNoticeTargetSendResult
  recipientFocusRequest?: RecipientFocusRequest
}

function ResultNoticePanel({
  kind,
  target,
  organizationName,
  interviewPeriod,
  recipients,
  control,
  onMessageReset,
  sendResult,
  recipientFocusRequest,
}: ResultNoticePanelProps) {
  const targetLabel = RESULT_NOTICE_TARGET_LABEL[target]
  const { field: subjectField, fieldState: subjectState } = useController({
    control,
    name: `${target}.subject`,
  })
  const { field: bodyField, fieldState: bodyState } = useController({
    control,
    name: `${target}.body`,
  })
  const message = { subject: subjectField.value, body: bodyField.value }
  const variableValues = getRecipientVariableValues(recipients[0], interviewPeriod)

  if (sendResult) {
    return (
      <>
        <SentMessageCard
          title={MESSAGE_TITLE[target]}
          target={target}
          organizationName={organizationName}
          message={sendResult.message}
          variableValues={variableValues}
        />
        <RecipientCard
          targetLabel={targetLabel}
          recipients={sendResult.recipients}
          deliverySummary={getDeliverySummary(sendResult.recipients)}
          recipientFocusRequest={recipientFocusRequest}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex gap-gap-l">
        <div className="min-w-70 flex-1">
          <MessageEditor
            title={MESSAGE_TITLE[target]}
            subject={subjectField.value}
            body={bodyField.value}
            variables={getNoticeVariables(kind, target)}
            onSubjectChange={subjectField.onChange}
            onBodyChange={bodyField.onChange}
            onSubjectBlur={subjectField.onBlur}
            onBodyBlur={bodyField.onBlur}
            onReset={onMessageReset}
            subjectError={subjectState.error?.message}
            bodyError={bodyState.error?.message}
          />
        </div>

        {/* 미리보기 높이는 작성 카드에 맞추고, 본문이 길면 메일 영역만 스크롤 */}
        <div className="relative w-95 shrink-0">
          <MessagePreview
            mailPreviewLabel={`${targetLabel} 메일 미리보기`}
            organizationName={organizationName}
            message={message}
            variableValues={variableValues}
            className="absolute inset-0"
          />
        </div>
      </div>
      <RecipientCard targetLabel={targetLabel} recipients={recipients} />
    </>
  )
}

// 전달 실패는 빨강, 이메일 확인으로 빠진 인원만 있으면 주황, 모두 전달하면 초록
function getDeliverySummaryColorClass({
  totalCount,
  deliveredCount,
  failedRecipients,
}: ResultNoticeDeliverySummary) {
  if (failedRecipients.length > 0) {
    return 'text-critical'
  }

  return deliveredCount < totalCount ? 'text-warning' : 'text-positive'
}

type RecipientCardProps = {
  targetLabel: string
  recipients: readonly ResultNoticeRecipient[]
  deliverySummary?: ResultNoticeDeliverySummary
  recipientFocusRequest?: RecipientFocusRequest
}

function RecipientCard({
  targetLabel,
  recipients,
  deliverySummary,
  recipientFocusRequest,
}: RecipientCardProps) {
  const emailCheckCount = countEmailCheckRecipients(recipients)
  const shouldShowEmailCheckBadge = !deliverySummary && emailCheckCount > 0

  return (
    <div className="overflow-hidden rounded-l border border-neutral-subtle bg-layer-default">
      <div className="flex items-center gap-gap-xs px-padding-xl py-padding-m">
        <p className="flex min-w-0 flex-1 gap-gap-xs text-headline1 font-semibold text-neutral">
          받는 사람
          <span className="truncate text-brand">{recipients.length}</span>
        </p>
        {shouldShowEmailCheckBadge && (
          <Badge tone="warning" variant="weak">
            이메일 확인 필요 {emailCheckCount}명
          </Badge>
        )}
        {deliverySummary && (
          <p
            className={cn(
              'shrink-0 text-label1 font-semibold',
              getDeliverySummaryColorClass(deliverySummary),
            )}
          >
            {deliverySummary.deliveredCount}/{deliverySummary.totalCount}명 전달
          </p>
        )}
      </div>
      <RecipientTable
        label={`${targetLabel} 받는 사람`}
        recipients={recipients}
        focusRequest={recipientFocusRequest}
      />
    </div>
  )
}

export { ResultNoticePanel }

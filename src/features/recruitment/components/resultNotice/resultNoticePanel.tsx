'use client'

import { useController, type Control } from 'react-hook-form'
import { Badge } from '@/components/ui/Badge/badge'
import type { ResultNoticeFormValues } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  RESULT_NOTICE_TARGET_LABEL,
  type ResultNoticeRecipient,
  type ResultNoticeTarget,
  type ResultNoticeVariable,
} from '@/features/recruitment/types'
import {
  countEmailCheckRecipients,
  getRecipientVariableValues,
} from '@/features/recruitment/utils/resultNoticeRecipient'
import { MessageEditor } from './messageEditor'
import { MessagePreview } from './messagePreview'
import { RecipientTable } from './recipientTable'

const MESSAGE_TITLE = {
  pass: '합격 안내 메시지',
  fail: '불합격 안내 메시지',
} satisfies Record<ResultNoticeTarget, string>

// TODO: 면접 일정 연결 후 면접 변수(기간·일시·장소) 노출 기준 정하기
const NOTICE_VARIABLES = ['이름', '포지션'] as const satisfies readonly ResultNoticeVariable[]

type ResultNoticePanelProps = {
  target: ResultNoticeTarget
  organizationName: string
  recipients: readonly ResultNoticeRecipient[]
  control: Control<ResultNoticeFormValues>
  onMessageReset: () => void
}

function ResultNoticePanel({
  target,
  organizationName,
  recipients,
  control,
  onMessageReset,
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

  return (
    <>
      <div className="flex gap-gap-l">
        <div className="min-w-70 flex-1">
          <MessageEditor
            title={MESSAGE_TITLE[target]}
            subject={subjectField.value}
            body={bodyField.value}
            variables={NOTICE_VARIABLES}
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
            variableValues={getRecipientVariableValues(recipients[0])}
            className="absolute inset-0"
          />
        </div>
      </div>
      <RecipientCard targetLabel={targetLabel} recipients={recipients} />
    </>
  )
}

type RecipientCardProps = {
  targetLabel: string
  recipients: readonly ResultNoticeRecipient[]
}

// TODO: 발송 후 헤더 오른쪽 발송 결과 요약과 표 상태 열 제목 연결
function RecipientCard({ targetLabel, recipients }: RecipientCardProps) {
  const emailCheckCount = countEmailCheckRecipients(recipients)

  return (
    <div className="overflow-hidden rounded-l border border-neutral-subtle bg-layer-default">
      <div className="flex items-center gap-gap-xs px-padding-xl py-padding-m">
        <p className="flex min-w-0 flex-1 gap-gap-xs text-headline1 font-semibold text-neutral">
          받는 사람
          <span className="truncate text-brand">{recipients.length}</span>
        </p>
        {emailCheckCount > 0 && (
          <Badge tone="warning" variant="weak">
            이메일 확인 필요 {emailCheckCount}명
          </Badge>
        )}
      </div>
      <RecipientTable label={`${targetLabel} 받는 사람`} recipients={recipients} />
    </div>
  )
}

export { ResultNoticePanel }

import BellIcon from '@/assets/icons/bell.svg'
import MailIcon from '@/assets/icons/mail.svg'
import { isFilled } from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import type { ResultNoticeMessage, ResultNoticeVariableValues } from '@/features/recruitment/types'
import { fillNoticeVariables } from '@/features/recruitment/utils/resultNoticeMessage'
import { cn } from '@/lib/utils'

const EMPTY_SUBJECT_TEXT = '제목 없음'
const EMPTY_BODY_TEXT = '내용 없음'

type MessagePreviewProps = {
  // 미리보기가 여러 개일 때 화면 리더가 구분하도록 영역 이름을 사용처에서 지정
  mailPreviewLabel: string
  organizationName: string
  message: ResultNoticeMessage
  variableValues: ResultNoticeVariableValues
  className?: string
}

function MessagePreview({
  mailPreviewLabel,
  organizationName,
  message,
  variableValues,
  className,
}: MessagePreviewProps) {
  const subject = fillNoticeVariables(message.subject, variableValues)
  const body = fillNoticeVariables(message.body, variableValues)
  const isSubjectEmpty = !isFilled(subject)
  const isBodyEmpty = !isFilled(body)
  const subjectText = isSubjectEmpty ? EMPTY_SUBJECT_TEXT : subject
  const subjectColorClass = isSubjectEmpty ? 'text-placeholder' : 'text-neutral'

  return (
    <div
      data-slot="message-preview"
      className={cn(
        'flex min-h-0 flex-col gap-gap-m rounded-l bg-neutral-weak p-padding-xl',
        className,
      )}
    >
      <p className="text-label1 font-semibold text-neutral-muted">미리보기</p>

      {/* 본문이 길면 이 영역만 스크롤 */}
      <div
        role="region"
        aria-label={mailPreviewLabel}
        tabIndex={0}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-gap-s overflow-y-auto rounded-m border border-neutral-subtle bg-layer-default p-padding-l',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        )}
      >
        <p className="flex items-center gap-gap-xs text-caption1 font-medium text-neutral-subtle">
          <MailIcon aria-hidden className="size-4 shrink-0" />
          {organizationName}
        </p>
        <p className={cn('text-body1 font-semibold break-words', subjectColorClass)}>
          {subjectText}
        </p>
        <hr className="border-neutral-subtle" />
        <p
          className={cn(
            'text-body2 font-normal break-words whitespace-pre-wrap',
            isBodyEmpty ? 'text-placeholder' : 'text-neutral-muted',
          )}
        >
          {isBodyEmpty ? EMPTY_BODY_TEXT : body}
        </p>
      </div>

      <div className="flex items-center gap-gap-s rounded-m border border-neutral-subtle bg-layer-default p-padding-m">
        <span className="flex shrink-0 rounded-full bg-brand-weak p-padding-xs text-brand">
          <BellIcon aria-hidden className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs font-medium">
          <p className="text-caption1 text-neutral-subtle">{organizationName}</p>
          <p className={cn('truncate text-label1', subjectColorClass)}>{subjectText}</p>
        </div>
      </div>
    </div>
  )
}

export { MessagePreview }

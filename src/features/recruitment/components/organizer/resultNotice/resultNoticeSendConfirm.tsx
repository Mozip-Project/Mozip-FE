import { Button } from '@/components/ui/Button/button'
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogSummary,
  DialogSummaryRow,
} from '@/components/ui/Dialog/dialog'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import type { ResultNoticeRecipients } from '@/features/recruitment/hooks/useResultNoticeSend'
import {
  RESULT_NOTICE_SEND_SUBJECT,
  RESULT_NOTICE_TARGET_LABEL,
  type ResultNoticeKind,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import {
  formatRecipients,
  getEmailCheckRecipients,
  getSendableRecipients,
  getTargetTitlePrefix,
} from '@/features/recruitment/utils/resultNoticeRecipient'

type ResultNoticeSendConfirmProps = {
  kind: ResultNoticeKind
  targets: readonly ResultNoticeTarget[]
  recipients: ResultNoticeRecipients
  onConfirm: () => void
}

// 발송 확인 창 내용, 이메일 확인 필요 인원은 빼고 발송
function ResultNoticeSendConfirm({
  kind,
  targets,
  recipients,
  onConfirm,
}: ResultNoticeSendConfirmProps) {
  const sendCounts = targets.map((target) => ({
    target,
    count: getSendableRecipients(recipients[target]).length,
  }))
  const totalCount = sendCounts.reduce((sum, { count }) => sum + count, 0)
  const emailCheckRecipients = targets.flatMap((target) =>
    getEmailCheckRecipients(recipients[target]),
  )

  return (
    <>
      <DialogHeader
        title={`${getTargetTitlePrefix(targets)}${totalCount}명에게 ${RESULT_NOTICE_SEND_SUBJECT[kind]} 발송할까요?`}
        description="발송한 뒤에는 취소하거나 다시 발송할 수 없어요."
      />
      <DialogSummary>
        {sendCounts.map(({ target, count }) => (
          <DialogSummaryRow key={target} label={RESULT_NOTICE_TARGET_LABEL[target]}>
            {count}명
          </DialogSummaryRow>
        ))}
      </DialogSummary>
      {emailCheckRecipients.length > 0 && (
        <InlineNotice tone="warning" title="이메일 확인 필요" className="w-full">
          {formatRecipients(emailCheckRecipients)}
        </InlineNotice>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">취소</Button>
        </DialogClose>
        <Button onClick={onConfirm}>발송하기</Button>
      </DialogFooter>
    </>
  )
}

export { ResultNoticeSendConfirm }

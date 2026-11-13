import { InlineNotice, InlineNoticeAction } from '@/components/ui/InlineNotice/inlineNotice'
import type { FailedRecipientsByTarget } from '@/features/recruitment/hooks/useResultNoticeSend'
import { RESULT_NOTICE_TARGETS, type ResultNoticeTarget } from '@/features/recruitment/types'

type DeliveryFailureNoticeProps = {
  currentTarget: ResultNoticeTarget
  failedRecipientsByTarget: FailedRecipientsByTarget
  onShowFailed: (target: ResultNoticeTarget) => void
}

function DeliveryFailureNotice({
  currentTarget,
  failedRecipientsByTarget,
  onShowFailed,
}: DeliveryFailureNoticeProps) {
  const failedTarget = RESULT_NOTICE_TARGETS.find(
    (target) => failedRecipientsByTarget[target].length > 0,
  )

  if (!failedTarget) {
    return null
  }

  const failedCount = failedRecipientsByTarget.pass.length + failedRecipientsByTarget.fail.length
  const canShowFailed = currentTarget !== failedTarget

  return (
    <InlineNotice
      tone="critical"
      title={`메일 ${failedCount}건이 전달되지 않았어요`}
      action={
        canShowFailed && (
          <InlineNoticeAction onClick={() => onShowFailed(failedTarget)}>
            실패한 지원자 보기
          </InlineNoticeAction>
        )
      }
      className="px-padding-xl"
    >
      MOZIP 알림은 전달됐어요. 메일을 받지 못한 지원자에게 직접 연락해 주세요.
    </InlineNotice>
  )
}

export { DeliveryFailureNotice }

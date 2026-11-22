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
  // 지금 탭에도 실패자가 있으면 지금 탭의 첫 실패 행으로 이동(접힌 행이면 표를 펼침)
  const hasCurrentTargetFailed = failedRecipientsByTarget[currentTarget].length > 0
  const failedTarget = hasCurrentTargetFailed
    ? currentTarget
    : RESULT_NOTICE_TARGETS.find((target) => failedRecipientsByTarget[target].length > 0)

  if (!failedTarget) {
    return null
  }

  const failedCount = failedRecipientsByTarget.pass.length + failedRecipientsByTarget.fail.length

  return (
    <InlineNotice
      tone="critical"
      title={`메일 ${failedCount}건이 전달되지 않았어요`}
      action={
        <InlineNoticeAction onClick={() => onShowFailed(failedTarget)}>
          실패한 지원자 보기
        </InlineNoticeAction>
      }
      className="px-padding-xl"
    >
      MOZIP 알림은 전달됐어요. 메일을 받지 못한 지원자에게 직접 연락해 주세요.
    </InlineNotice>
  )
}

export { DeliveryFailureNotice }

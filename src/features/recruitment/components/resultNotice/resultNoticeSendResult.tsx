import CheckIcon from '@/assets/icons/check.svg'
import { Button } from '@/components/ui/Button/button'
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogSummary,
  DialogSummaryRow,
} from '@/components/ui/Dialog/dialog'
import { InlineNotice, InlineNoticeAction } from '@/components/ui/InlineNotice/inlineNotice'
import type {
  ResultNoticeRecipients,
  ResultNoticeSendResults,
} from '@/features/recruitment/hooks/useResultNoticeSend'
import {
  DOCUMENT_RESULT_STATUS_LABEL,
  RESULT_NOTICE_SEND_SUBJECT,
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeTargetSendResult,
  type ResultNoticeKind,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import {
  formatRecipients,
  getDeliverySummary,
  getTargetTitlePrefix,
} from '@/features/recruitment/utils/resultNoticeRecipient'

type ResultNoticeSendResultProps = {
  kind: ResultNoticeKind
  targets: readonly ResultNoticeTarget[]
  recipients: ResultNoticeRecipients
  results: ResultNoticeSendResults
  // 남은 메시지 확인 시 이동할 탭
  onTargetChange: (target: ResultNoticeTarget) => void
  onShowFailed: (target: ResultNoticeTarget) => void
}

function ResultNoticeSendResult({
  kind,
  targets,
  recipients,
  results,
  onTargetChange,
  onShowFailed,
}: ResultNoticeSendResultProps) {
  const summaryTargets = RESULT_NOTICE_TARGETS.filter((target) => recipients[target].length > 0)
  const summaries = targets.map((target) => ({
    target,
    ...getDeliverySummary(results[target]?.recipients ?? []),
  }))
  const sentCount = summaries.reduce((sum, summary) => sum + summary.sentCount, 0)
  const failedTarget = summaries.find((summary) => summary.failedRecipients.length > 0)?.target
  const failedRecipients = summaries.flatMap((summary) => summary.failedRecipients)
  const unsentTarget = summaryTargets.find((target) => results[target] === undefined)

  return (
    <>
      <DialogHeader
        icon={<CheckIcon />}
        title={`${getTargetTitlePrefix(targets)}${sentCount}명에게 ${RESULT_NOTICE_SEND_SUBJECT[kind]} 발송했어요`}
      />
      <DialogSummary>
        {summaryTargets.map((target) => (
          <SendResultRow key={target} target={target} result={results[target]} />
        ))}
      </DialogSummary>
      {failedTarget && (
        <InlineNotice
          tone="critical"
          title="전달 실패"
          action={
            <InlineNoticeAction
              aria-label="전달 실패한 지원자 보기"
              onClick={() => onShowFailed(failedTarget)}
            />
          }
          className="w-full"
        >
          {formatRecipients(failedRecipients)}
        </InlineNotice>
      )}
      <DialogFooter>
        {unsentTarget ? (
          <>
            <DialogClose asChild>
              <Button variant="secondary">닫기</Button>
            </DialogClose>
            <Button onClick={() => onTargetChange(unsentTarget)}>
              {DOCUMENT_RESULT_STATUS_LABEL[unsentTarget]} 메시지 확인하기
            </Button>
          </>
        ) : (
          <DialogClose asChild>
            <Button>확인</Button>
          </DialogClose>
        )}
      </DialogFooter>
    </>
  )
}

type SendResultRowProps = {
  target: ResultNoticeTarget
  result: ResultNoticeTargetSendResult | undefined
}

function SendResultRow({ target, result }: SendResultRowProps) {
  const label = RESULT_NOTICE_TARGET_LABEL[target]

  if (!result) {
    return (
      <DialogSummaryRow label={label} tone="subtle">
        아직 발송하지 않았어요
      </DialogSummaryRow>
    )
  }

  const { sentCount, deliveredCount } = getDeliverySummary(result.recipients)

  return (
    <DialogSummaryRow label={label} tone={deliveredCount < sentCount ? 'critical' : 'positive'}>
      {deliveredCount}/{sentCount}명 전달
    </DialogSummaryRow>
  )
}

export { ResultNoticeSendResult }

'use client'

import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { SummaryBar, type SummaryBarStatus } from '@/components/ui/SummaryBar/summaryBar'
import {
  DOCUMENT_RESULT_STATUS_LABEL,
  RESULT_NOTICE_SEND_SUBJECT,
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeKind,
  type ResultNoticeMissingField,
  type ResultNoticeSendState,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import type { ReactNode } from 'react'

type VisibleSendState = Exclude<ResultNoticeSendState, { type: 'allSent' }>

// 눌러서 안내를 열 수 있도록 disabled 대신 aria-disabled, 모양은 비활성과 동일
const BLOCKED_BUTTON_CLASS =
  'aria-disabled:cursor-default aria-disabled:border-neutral-muted aria-disabled:bg-disabled aria-disabled:text-disabled aria-disabled:hover:border-neutral-muted aria-disabled:hover:bg-disabled'

const MISSING_FIELD_LABEL = {
  subject: '메일 제목',
  body: '본문',
  both: '메일 제목과 본문',
} satisfies Record<ResultNoticeMissingField, string>

function getMissingInputMessage(missingField: ResultNoticeMissingField) {
  return `${MISSING_FIELD_LABEL[missingField]}을 입력하면 발송할 수 있어요.`
}

type ResultNoticeSummaryBarProps = {
  kind: ResultNoticeKind
  state: ResultNoticeSendState
  currentTarget: ResultNoticeTarget
  // 이메일 확인 필요 인원을 뺀 탭별 발송 인원
  sendCounts: Record<ResultNoticeTarget, number>
  // 발송 확인 창을 열 대상
  onSendRequest: (targets: readonly ResultNoticeTarget[]) => void
  onTargetChange: (target: ResultNoticeTarget) => void
}

function ResultNoticeSummaryBar({
  kind,
  state,
  currentTarget,
  sendCounts,
  onSendRequest,
  onTargetChange,
}: ResultNoticeSummaryBarProps) {
  if (state.type === 'allSent') {
    return null
  }

  const { status, message, actions } = getSummaryBarContent(state, {
    kind,
    currentTarget,
    sendCounts,
    onSendRequest,
    onTargetChange,
  })

  return (
    <SummaryBar status={status} actions={actions}>
      {message}
    </SummaryBar>
  )
}

type SummaryBarContent = {
  status: SummaryBarStatus
  message: string
  actions: ReactNode
}

type SummaryBarContext = Omit<ResultNoticeSummaryBarProps, 'state'>

function getSummaryBarContent(
  state: VisibleSendState,
  { kind, currentTarget, sendCounts, onSendRequest, onTargetChange }: SummaryBarContext,
): SummaryBarContent {
  const sendButtonsProps = { currentTarget, sendCounts, onSendRequest }
  const totalCount = sendCounts.pass + sendCounts.fail

  switch (state.type) {
    // 불합격자 없는 경우
    case 'allPassed': {
      const passSendButton = (
        <Button
          size="m"
          disabled={state.missingField !== null}
          onClick={() => onSendRequest(['pass'])}
        >
          {RESULT_NOTICE_TARGET_LABEL.pass} {sendCounts.pass}명에게 발송하기
        </Button>
      )

      if (state.missingField && currentTarget === 'pass') {
        return {
          status: 'blocked',
          message: getMissingInputMessage(state.missingField),
          actions: passSendButton,
        }
      }

      return {
        status: 'ready',
        message: '모두 합격이라 합격 메시지만 발송하면 돼요.',
        actions: passSendButton,
      }
    }

    // 불합격자 탭 확인 전
    case 'reviewPending':
      return {
        status: 'blocked',
        message: '불합격 메시지를 확인하면 모두에게 발송할 수 있어요.',
        actions: (
          <SendButtons
            {...sendButtonsProps}
            canSendCurrent={state.canSendCurrent}
            canSendAll={false}
            sendAllBlockedNotice={{
              title: '불합격 메시지를 아직 확인하지 않았어요',
              description: `${RESULT_NOTICE_TARGET_LABEL.fail} ${sendCounts.fail}명에게 발송할 메시지를 확인하면 ${totalCount}명에게 한 번에 발송할 수 있어요.`,
            }}
          />
        ),
      }

    // 입력 누락으로 발송 불가한 경우
    case 'missingInput':
      return {
        status: 'blocked',
        message: getMissingInputMessage(state.missingField),
        actions: (
          <SendButtons
            {...sendButtonsProps}
            canSendCurrent={state.target !== currentTarget}
            canSendAll={false}
          />
        ),
      }

    case 'ready':
      return {
        status: 'ready',
        message: '합격 · 불합격 메시지를 모두 확인했어요.',
        actions: <SendButtons {...sendButtonsProps} canSendCurrent canSendAll />,
      }

    case 'sending':
      return {
        status: 'ready',
        message: `${RESULT_NOTICE_SEND_SUBJECT[kind]} 발송하고 있어요.`,
        actions: <SendButtons {...sendButtonsProps} canSendCurrent={false} canSendAll={false} />,
      }

    case 'partiallySent': {
      const { unsentTarget } = state
      // 발송한 탭에서는 남은 탭으로 이동, 남은 탭에서는 바로 발송
      const unsentTargetAction =
        currentTarget === unsentTarget ? (
          <Button
            size="m"
            disabled={!state.canSendUnsent}
            onClick={() => onSendRequest([unsentTarget])}
          >
            {RESULT_NOTICE_TARGET_LABEL[unsentTarget]} {sendCounts[unsentTarget]}명에게 발송하기
          </Button>
        ) : (
          <Button size="m" onClick={() => onTargetChange(unsentTarget)}>
            {DOCUMENT_RESULT_STATUS_LABEL[unsentTarget]} 메시지 확인하기
          </Button>
        )

      return {
        status: 'ready',
        message: `${RESULT_NOTICE_TARGET_LABEL[unsentTarget]}에게는 아직 발송하지 않았어요.`,
        actions: unsentTargetAction,
      }
    }
  }
}

type BlockedNotice = {
  title: string
  description: string
}

type SendButtonsProps = {
  currentTarget: ResultNoticeTarget
  sendCounts: Record<ResultNoticeTarget, number>
  canSendCurrent: boolean
  canSendAll: boolean
  sendAllBlockedNotice?: BlockedNotice
  onSendRequest: (targets: readonly ResultNoticeTarget[]) => void
}

function SendButtons({
  currentTarget,
  sendCounts,
  canSendCurrent,
  canSendAll,
  sendAllBlockedNotice,
  onSendRequest,
}: SendButtonsProps) {
  const sendAllLabel = `${sendCounts.pass + sendCounts.fail}명에게 발송하기`
  const shouldExplainBlockedSendAll = !canSendAll && sendAllBlockedNotice !== undefined

  return (
    <>
      <Button
        variant="secondary"
        size="m"
        disabled={!canSendCurrent}
        onClick={() => onSendRequest([currentTarget])}
      >
        {RESULT_NOTICE_TARGET_LABEL[currentTarget]} {sendCounts[currentTarget]}명에게만 발송하기
      </Button>
      {shouldExplainBlockedSendAll ? (
        <InfoPopover
          trigger={
            <Button size="m" aria-disabled className={BLOCKED_BUTTON_CLASS}>
              {sendAllLabel}
            </Button>
          }
          title={sendAllBlockedNotice.title}
          description={sendAllBlockedNotice.description}
          side="top"
          align="end"
          className="w-80"
        />
      ) : (
        <Button
          size="m"
          disabled={!canSendAll}
          onClick={() => onSendRequest(RESULT_NOTICE_TARGETS)}
        >
          {sendAllLabel}
        </Button>
      )}
    </>
  )
}

export { ResultNoticeSummaryBar }

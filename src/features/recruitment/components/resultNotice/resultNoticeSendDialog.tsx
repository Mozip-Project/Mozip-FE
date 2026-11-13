'use client'

import { useRef } from 'react'
import MailIcon from '@/assets/icons/mail.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProgress,
} from '@/components/ui/Dialog/dialog'
import type {
  ResultNoticeRecipients,
  ResultNoticeSendDialogState,
  ResultNoticeSendProgress,
  ResultNoticeSendResults,
} from '@/features/recruitment/hooks/useResultNoticeSend'
import {
  RESULT_NOTICE_SEND_SUBJECT,
  type ResultNoticeKind,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import { ResultNoticeSendConfirm } from './resultNoticeSendConfirm'
import { ResultNoticeSendResult } from './resultNoticeSendResult'

type ResultNoticeSendDialogProps = {
  kind: ResultNoticeKind
  dialog: ResultNoticeSendDialogState | null
  recipients: ResultNoticeRecipients
  progress: ResultNoticeSendProgress | null
  results: ResultNoticeSendResults
  onClose: () => void
  onConfirm: () => void
  // 남은 메시지 확인 시 이동할 탭
  onTargetChange: (target: ResultNoticeTarget) => void
  onShowFailed: (target: ResultNoticeTarget) => void
  // 창을 연 버튼이 사라지거나 비활성이면 대신 focus 받을 요소
  getFallbackFocusTarget: () => HTMLElement | null | undefined
}

// 확인 → 발송 중 → 결과를 한 창에서 이어서 표시
function ResultNoticeSendDialog({
  kind,
  dialog,
  recipients,
  progress,
  results,
  onClose,
  onConfirm,
  onTargetChange,
  onShowFailed,
  getFallbackFocusTarget,
}: ResultNoticeSendDialogProps) {
  const openerRef = useRef<HTMLElement | null>(null)
  const shouldKeepFocusOnCloseRef = useRef(false)

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose()
    }
  }

  // Radix가 창 안으로 focus를 옮기기 전이라 activeElement가 연 버튼
  function handleOpenAutoFocus() {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
  }

  // Trigger 없이 여는 창이라 닫힌 뒤 focus 직접 복귀, 실패 행으로 이동했으면 그 행 유지
  function handleCloseAutoFocus(event: Event) {
    event.preventDefault()

    if (shouldKeepFocusOnCloseRef.current) {
      shouldKeepFocusOnCloseRef.current = false
      return
    }

    const opener = openerRef.current
    opener?.focus()

    if (document.activeElement !== opener) {
      getFallbackFocusTarget()?.focus()
    }
  }

  function handleShowFailed(target: ResultNoticeTarget) {
    shouldKeepFocusOnCloseRef.current = true
    onShowFailed(target)
  }

  return (
    <Dialog open={dialog !== null} onOpenChange={handleOpenChange}>
      {dialog && (
        <DialogContent
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          {dialog.phase === 'confirm' && (
            <ResultNoticeSendConfirm
              kind={kind}
              targets={dialog.targets}
              recipients={recipients}
              onConfirm={onConfirm}
            />
          )}
          {dialog.phase === 'sending' && <SendingContent kind={kind} progress={progress} />}
          {dialog.phase === 'result' && (
            <ResultNoticeSendResult
              kind={kind}
              targets={dialog.targets}
              recipients={recipients}
              results={results}
              onTargetChange={onTargetChange}
              onShowFailed={handleShowFailed}
            />
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}

type SendingContentProps = {
  kind: ResultNoticeKind
  progress: ResultNoticeSendProgress | null
}

function SendingContent({ kind, progress }: SendingContentProps) {
  const sentCount = progress?.sentCount ?? 0
  const totalCount = progress?.totalCount ?? 0

  return (
    <>
      <DialogHeader
        icon={<MailIcon />}
        title={`${RESULT_NOTICE_SEND_SUBJECT[kind]} 발송하고 있어요`}
        description="창을 닫아도 발송은 계속돼요"
      />
      <DialogProgress
        label="메일 + MOZIP 알림"
        valueText={`${sentCount} / ${totalCount}명`}
        value={sentCount}
        max={totalCount}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">닫고 계속 작업하기</Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export { ResultNoticeSendDialog }

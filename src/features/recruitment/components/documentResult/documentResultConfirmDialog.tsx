'use client'

import { useState, type ComponentProps } from 'react'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import CheckIcon from '@/assets/icons/check.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogSummary,
} from '@/components/ui/Dialog/dialog'
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast/toast'
import { useConfirmDocumentResultsMutation } from '@/features/recruitment/hooks/useDocumentResults'
import type { DocumentResult } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'

type DocumentResultConfirmDialogProps = {
  recruitmentId: string
  hasInterviewStep: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  resultCounts: Record<DocumentResult, number>
  toastViewportClassName?: string
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus']
}

function DocumentResultConfirmDialog({
  recruitmentId,
  isOpen,
  onOpenChange,
  hasInterviewStep,
  resultCounts,
  toastViewportClassName,
  onCloseAutoFocus,
}: DocumentResultConfirmDialogProps) {
  const { mutate: confirmResults, isPending } = useConfirmDocumentResultsMutation(recruitmentId)
  const [isFailureToastOpen, setIsFailureToastOpen] = useState(false)
  const followUpMessage = hasInterviewStep
    ? '이후 면접 일정을 등록하고 지원자에게 안내할 수 있어요.'
    : '이후 지원자에게 서류 전형 결과를 안내할 수 있어요.'

  function handleOpenChange(nextIsOpen: boolean) {
    if (!isPending) {
      onOpenChange(nextIsOpen)
    }
  }

  function handleConfirm() {
    if (isPending) {
      return
    }

    setIsFailureToastOpen(false)
    confirmResults(undefined, {
      onSuccess: () => onOpenChange(false),
      onError: () => setIsFailureToastOpen(true),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader
          icon={<CheckIcon />}
          title="서류 결과를 확정할까요?"
          description={
            <>
              확정 후에는 결과를 변경할 수 없어요.
              <br />
              {followUpMessage}
            </>
          }
        />
        <DialogSummary>
          <ResultCountRow label="합격" count={resultCounts.pass} valueClassName="text-positive" />
          <ResultCountRow label="불합격" count={resultCounts.fail} valueClassName="text-neutral" />
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {/* 요청 중 focus 유지를 위해 disabled 대신 aria-disabled 사용 */}
          <Button aria-disabled={isPending} onClick={handleConfirm}>
            {isPending ? '확정 중' : '확정하기'}
          </Button>
        </DialogFooter>
        {/* overlay 위 표시와 스크린 리더 접근을 위해 팝업 안 배치, absolute로 gap 제외 */}
        <div className="absolute">
          <ToastProvider>
            <Toast
              type="foreground"
              title="결과를 확정하지 못했어요. 다시 시도해 주세요."
              icon={<AlertCircleIcon aria-hidden className="size-6 shrink-0 text-critical" />}
              open={isFailureToastOpen}
              onOpenChange={setIsFailureToastOpen}
            />
            <ToastViewport className={toastViewportClassName} />
          </ToastProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type ResultCountRowProps = {
  label: string
  count: number
  valueClassName: string
}

function ResultCountRow({ label, count, valueClassName }: ResultCountRowProps) {
  return (
    <div className="flex items-center justify-between gap-gap-s">
      <dt className="min-w-0 text-label2 font-normal text-neutral-subtle">{label}</dt>
      <dd className={cn('shrink-0 text-right text-label1 font-medium', valueClassName)}>
        {count}명
      </dd>
    </div>
  )
}

export { DocumentResultConfirmDialog }

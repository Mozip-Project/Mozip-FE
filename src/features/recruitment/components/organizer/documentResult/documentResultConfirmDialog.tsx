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
  DialogSummaryRow,
} from '@/components/ui/Dialog/dialog'
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast/toast'
import { useConfirmDocResultMutation } from '@/features/recruitment/api/organizer/queries'
import type { DocumentResult } from '@/features/recruitment/types'
import { ApiError } from '@/lib/apiError'

// 두 번 클릭 하거나 다른 운영진이 먼저 확정한 경우, 재조회로 확정 후 화면이 되므로 실패 안내 없이 닫기
const ALREADY_CONFIRMED_ERROR_CODE = 'EVALUATION_423'

type DocumentResultConfirmDialogProps = {
  postingId: string
  hasInterviewStep: boolean
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  resultCounts: Record<DocumentResult, number>
  onCloseAutoFocus: ComponentProps<typeof DialogContent>['onCloseAutoFocus']
}

function DocumentResultConfirmDialog({
  postingId,
  isOpen,
  onOpenChange,
  hasInterviewStep,
  resultCounts,
  onCloseAutoFocus,
}: DocumentResultConfirmDialogProps) {
  const { mutate: confirmResults, isPending } = useConfirmDocResultMutation(postingId)
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
      onError: (error) => {
        if (error instanceof ApiError && error.code === ALREADY_CONFIRMED_ERROR_CODE) {
          onOpenChange(false)
          return
        }
        setIsFailureToastOpen(true)
      },
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
          <DialogSummaryRow label="합격" tone="positive">
            {resultCounts.pass}명
          </DialogSummaryRow>
          <DialogSummaryRow label="불합격">{resultCounts.fail}명</DialogSummaryRow>
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {/* 요청 중 focus 유지를 위해 disabled 대신 aria-disabled 사용 */}
          <Button
            aria-disabled={isPending}
            onClick={handleConfirm}
            data-track-target="doc_result_confirm"
          >
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
            <ToastViewport />
          </ToastProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DocumentResultConfirmDialog }

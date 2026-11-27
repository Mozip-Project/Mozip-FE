import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogSummary,
  DialogSummaryRow,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import type { ReactElement } from 'react'

type ConfirmTimetableDialogProps = {
  trigger: ReactElement
  // 면접 기간·인원 요약
  summary: string
  onConfirm: () => void
}

function ConfirmTimetableDialog({ trigger, summary, onConfirm }: ConfirmTimetableDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader
          title="타임테이블을 확정할까요?"
          description="확정한 뒤에도 수정할 수 있어요."
        />
        <DialogSummary>
          <DialogSummaryRow label="면접">{summary}</DialogSummaryRow>
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onConfirm}>확정하기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmTimetableDialog }

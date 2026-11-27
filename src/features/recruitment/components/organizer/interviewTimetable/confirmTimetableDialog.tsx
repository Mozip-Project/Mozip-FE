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
  title: string
  description: string
  // 면접 기간·인원 요약
  summary: string
  onConfirm: () => void
}

function ConfirmTimetableDialog({
  trigger,
  title,
  description,
  summary,
  onConfirm,
}: ConfirmTimetableDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader title={title} description={description} />
        <DialogSummary>
          <DialogSummaryRow label="면접">{summary}</DialogSummaryRow>
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onConfirm} data-track-target="timetable_confirm">
              확정하기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmTimetableDialog }

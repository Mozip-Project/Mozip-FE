'use client'

import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/Dialog/dialog'

type ApplicationLeaveDialogProps = {
  open: boolean
  onStay: () => void
  onLeave: () => void
}

function ApplicationLeaveDialog({ open, onStay, onLeave }: ApplicationLeaveDialogProps) {
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onStay()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader
          title="저장되지 않은 내용이 있어요"
          description="지금 나가면 마지막 저장 후 작성한 내용이 사라져요"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onLeave}>
            나가기
          </Button>
          <DialogClose asChild>
            <Button>이어 쓰기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ApplicationLeaveDialog }

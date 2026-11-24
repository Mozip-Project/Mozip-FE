'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button/button'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/Dialog/dialog'

type ApplicationSubmitDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSubmitting: boolean
  onSubmit: () => void
}

function ApplicationSubmitDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: ApplicationSubmitDialogProps) {
  // 닫아도 요청은 취소되지 않아 응답 전까지 닫기 차단
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) {
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <SubmitConfirmForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

type SubmitConfirmFormProps = Pick<ApplicationSubmitDialogProps, 'isSubmitting' | 'onSubmit'>

function SubmitConfirmForm({ isSubmitting, onSubmit }: SubmitConfirmFormProps) {
  const [hasAgreed, setHasAgreed] = useState(false)

  return (
    <>
      <DialogHeader
        title="지원서를 제출할까요?"
        description="제출 후에는 수정하거나 철회할 수 없어요"
      />
      <Checkbox
        className="w-full break-keep"
        required
        checked={hasAgreed}
        onCheckedChange={(checked) => setHasAgreed(checked === true)}
      >
        [필수] 지원서 정보를 운영진에게 제공하는 데 동의합니다.
      </Checkbox>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" disabled={isSubmitting}>
            취소
          </Button>
        </DialogClose>
        <Button disabled={!hasAgreed || isSubmitting} onClick={onSubmit}>
          {isSubmitting ? '제출 중…' : '제출하기'}
        </Button>
      </DialogFooter>
    </>
  )
}

export { ApplicationSubmitDialog }

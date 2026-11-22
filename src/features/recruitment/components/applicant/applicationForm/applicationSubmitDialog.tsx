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
}

function ApplicationSubmitDialog({ open, onOpenChange }: ApplicationSubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <SubmitConfirmForm />
      </DialogContent>
    </Dialog>
  )
}

function SubmitConfirmForm() {
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
          <Button variant="secondary">취소</Button>
        </DialogClose>
        {/* TODO: 지원서 제출 API 연결 후 요청·완료 후 이동 처리(이동처 미정) */}
        <Button disabled={!hasAgreed}>제출하기</Button>
      </DialogFooter>
    </>
  )
}

export { ApplicationSubmitDialog }

'use client'

import { useState } from 'react'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'

type PostingPublishDialogProps = {
  isPublishing: boolean
  // 성공하면 화면을 떠나고, 실패하면 false를 받아 팝업을 닫고 안내를 보여 줌
  onPublish: () => Promise<boolean>
}

function PostingPublishDialog({ isPublishing, onPublish }: PostingPublishDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  // 게시 요청 중에는 닫지 않음
  function handleOpenChange(nextOpen: boolean) {
    if (!isPublishing) {
      setIsOpen(nextOpen)
    }
  }

  async function handlePublish() {
    if (!(await onPublish())) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="m">공고 게시</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          icon={<MegaphoneIcon />}
          title="공고를 게시하시겠어요?"
          description="게시 후에도 공고 관리에서 수정이 가능해요"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isPublishing}>
              취소
            </Button>
          </DialogClose>
          <Button disabled={isPublishing} onClick={() => void handlePublish()}>
            {isPublishing ? '게시 중' : '게시하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PostingPublishDialog }

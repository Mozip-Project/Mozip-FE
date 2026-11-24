'use client'

import { useIsMutating } from '@tanstack/react-query'
import { useState, type ComponentProps } from 'react'
import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog/dialog'
import { SEND_NOTICE_MUTATION_KEY } from '@/features/posting/api/organizer/queries'
import { PostingNoticeForm } from './postingNoticeForm'

type PostingNoticeDialogProps = Omit<ComponentProps<typeof PostingNoticeForm>, 'onSent'>

// 닫으면 내용이 해제되어 다시 열 때 기본 문구로 시작
function PostingNoticeDialog(props: PostingNoticeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isSending = useIsMutating({ mutationKey: SEND_NOTICE_MUTATION_KEY }) > 0

  // 발송 중에 닫으면 결과 안내를 놓쳐 닫기 막음
  function handleOpenChange(nextIsOpen: boolean) {
    if (!isSending) {
      setIsOpen(nextIsOpen)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="m">
          공지 보내기
          <ArrowRightIcon aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        overlayClassName="py-10"
        className="my-auto w-265 items-stretch gap-0 px-padding-xl py-7 shadow-none"
      >
        <PostingNoticeForm {...props} onSent={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export { PostingNoticeDialog }

'use client'

import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import { Button } from '@/components/ui/Button/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog/dialog'
import { PostingNoticeForm } from './postingNoticeForm'
import type { ComponentProps } from 'react'

type PostingNoticeDialogProps = ComponentProps<typeof PostingNoticeForm>

// 닫으면 내용이 해제되어 다시 열 때 기본 문구로 시작
function PostingNoticeDialog(props: PostingNoticeDialogProps) {
  return (
    <Dialog>
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
        <PostingNoticeForm {...props} />
      </DialogContent>
    </Dialog>
  )
}

export { PostingNoticeDialog }

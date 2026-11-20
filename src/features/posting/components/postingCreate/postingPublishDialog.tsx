'use client'

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

function PostingPublishDialog() {
  return (
    <Dialog>
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
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {/* TODO: 공고 게시 API 연결 후 성공 시 이동·실패 안내 처리 */}
          <DialogClose asChild>
            <Button>게시하기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PostingPublishDialog }

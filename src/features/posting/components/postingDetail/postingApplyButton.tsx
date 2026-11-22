'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { getPostingApplyPath } from '@/features/posting/utils/postingRoutes'
import { useMeQuery } from '@/features/user/api/queries'

type PostingApplyButtonProps = {
  postingId: string
}

function PostingApplyButton({ postingId }: PostingApplyButtonProps) {
  const { isSuccess: isLoggedIn } = useMeQuery()

  if (isLoggedIn) {
    return (
      <Button asChild size="m">
        <Link href={getPostingApplyPath(postingId)}>지원하기</Link>
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="m">지원하기</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader
          title="지원서를 작성하려면 로그인이 필요해요"
          description="로그인하고 지원서 작성을 시작해 보세요"
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>

          {/* TODO: 로그인 화면 생기면 로그인 경로로 연결 */}
          <Button>로그인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PostingApplyButton }

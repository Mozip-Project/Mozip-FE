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
import { ServerPostingUnsupportedButton } from '@/features/posting/components/demoServerPosting/serverPostingUnsupportedButton'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import { getPostingApplyPath } from '@/features/posting/utils/postingRoutes'
import { useMeQuery } from '@/features/user/api/queries'
import { useMockLogin } from '@/features/user/hooks/useMockLogin'

type PostingApplyButtonProps = {
  postingId: string
}

function PostingApplyButton({ postingId }: PostingApplyButtonProps) {
  const { isSuccess: isLoggedIn } = useMeQuery()
  const loginAsMockUser = useMockLogin()

  if (isLoggedIn) {
    // 시연 모드의 실서버 공고는 지원서 작성이 서버에 없어 안내만 (전시회 후 삭제)
    if (isServerPosting(postingId)) {
      return <ServerPostingUnsupportedButton size="m">지원하기</ServerPostingUnsupportedButton>
    }

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

          {/* TODO: 로그인 화면 생기면 로그인 경로로 연결, 임시로 MSW me 응답만 성공으로 전환 */}
          <Button onClick={loginAsMockUser}>로그인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PostingApplyButton }

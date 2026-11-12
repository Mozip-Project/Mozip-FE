'use client'

import { useState } from 'react'
import CheckIcon from '@/assets/icons/check.svg'
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
import {
  useUpPostingMutation,
  useUpRemainingCount,
} from '@/features/posting/hooks/useManagedPostings'
import { POSTING_UP_RANK } from '@/features/posting/types'
import { useToast } from '@/providers/toastProvider'

type PostingUpDialogProps = {
  postingId: string
  title: string
  latestRank: number
}

function PostingUpDialog({ postingId, title, latestRank }: PostingUpDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const remainingCount = useUpRemainingCount()
  const { mutate: upPosting, isPending } = useUpPostingMutation()
  const { showToast } = useToast()
  // TODO: 남은 횟수가 없을 때의 이용권 안내 디자인 확정 후 반영
  const canUp = remainingCount !== undefined && remainingCount > 0

  function handleOpenChange(nextIsOpen: boolean) {
    if (!isPending) {
      setIsOpen(nextIsOpen)
    }
  }

  // TODO: UP 실패 안내 디자인 확정 후 반영
  function handleUp() {
    if (!canUp || isPending) {
      return
    }

    upPosting(postingId, {
      onSuccess: (result) => {
        setIsOpen(false)
        showToast({
          title: '공고 UP을 완료했어요',
          description: `최신순 ${result.latestRank}위로 변경되었어요`,
        })
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="brand" size="s" aria-label={`${title} UP하기`}>
          UP하기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          icon={<CheckIcon />}
          title="공고를 다시 위로 올릴까요?"
          description="UP하면 최신순 목록 맨 위에 노출돼요"
        />
        <DialogSummary>
          <DialogSummaryRow label="노출 순위" tone="positive">
            <ValueChange from={`${latestRank}위`} to={`${POSTING_UP_RANK}위`} />
          </DialogSummaryRow>
          <DialogSummaryRow label="UP하기 잔여" tone="subtle">
            {remainingCount === undefined ? (
              <span aria-hidden>-</span>
            ) : (
              <ValueChange
                from={`${remainingCount}회`}
                to={`${Math.max(remainingCount - 1, 0)}회`}
              />
            )}
          </DialogSummaryRow>
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {/* 요청 중 focus 유지를 위해 disabled 대신 aria-disabled 사용 */}
          <Button aria-disabled={!canUp || isPending} onClick={handleUp}>
            1회 사용하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 화살표는 화면 리더에 '에서'로 읽히도록 대체
function ValueChange({ from, to }: { from: string; to: string }) {
  return (
    <>
      {from} <span aria-hidden>-&gt;</span>
      <span className="sr-only">에서</span> {to}
    </>
  )
}

export { PostingUpDialog }

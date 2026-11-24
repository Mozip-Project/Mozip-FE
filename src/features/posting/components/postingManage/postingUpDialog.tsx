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
  useBumpPostingMutation,
  useManagedPostingSummaryQuery,
} from '@/features/posting/api/organizer/queries'
import { POSTING_UP_RANK } from '@/features/posting/types'
import { useToast } from '@/providers/toastProvider'

type PostingUpDialogProps = {
  organizationId: string
  postingId: string
  title: string
  latestRank: number
}

function PostingUpDialog({ organizationId, postingId, title, latestRank }: PostingUpDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  // 단체 단위 잔여 횟수라 탭 숫자와 같은 요약 조회 캐시 사용
  const remainingCount = useManagedPostingSummaryQuery(organizationId).data?.upCredits
  const { mutate: upPosting, isPending } = useBumpPostingMutation()
  const { showToast } = useToast()
  // TODO: 남은 횟수가 없을 때의 이용권 안내 디자인 확정 후 반영, 지금은 팝업의 사용 버튼 비활성만
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
          description: `최신순 ${result.bumpRank ?? POSTING_UP_RANK}위로 변경되었어요`,
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
            <RemainingCount remainingCount={remainingCount} />
          </DialogSummaryRow>
        </DialogSummary>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          {/* 잔여 없음은 비활성 모양, 요청 중은 focus 유지를 위해 aria-disabled */}
          <Button disabled={!canUp} aria-disabled={isPending} onClick={handleUp}>
            1회 사용하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 쓸 수 있을 때만 사용 후 값으로 바뀌는 모습 표시
function RemainingCount({ remainingCount }: { remainingCount: number | undefined }) {
  if (remainingCount === undefined) {
    return <span aria-hidden>-</span>
  }
  if (remainingCount === 0) {
    return <>0회</>
  }
  return <ValueChange from={`${remainingCount}회`} to={`${remainingCount - 1}회`} />
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

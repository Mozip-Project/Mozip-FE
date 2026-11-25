import Link from 'next/link'
import CheckIcon from '@/assets/icons/check.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/Dialog/dialog'
import { getDocumentReviewPath } from '@/features/recruitment/utils/recruitmentRoutes'

type DocumentEvaluationDoneDialogProps = {
  postingId: string
  // 칩 목록을 못 받았으면 인원 없이 표시
  applicantCount: number | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DocumentEvaluationDoneDialog({
  postingId,
  applicantCount,
  open,
  onOpenChange,
}: DocumentEvaluationDoneDialogProps) {
  const title =
    applicantCount === undefined
      ? '모두 평가를 마쳤어요'
      : `${applicantCount}명 모두 평가를 마쳤어요`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          icon={<CheckIcon />}
          title={title}
          description="서류 결과가 확정되기 전까지는 평가를 수정할 수 있어요"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">계속 둘러보기</Button>
          </DialogClose>
          <Button asChild>
            <Link href={getDocumentReviewPath(postingId)}>지원자 목록으로</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DocumentEvaluationDoneDialog }

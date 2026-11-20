'use client'

import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { Radio, RadioGroup } from '@/components/ui/Radio/radio'
import { TextArea } from '@/components/ui/TextArea/textArea'
import { usePostingReportForm } from '@/features/posting/hooks/usePostingReportForm'
import type { ReportReason } from '@/gql/graphql'

const REPORT_REASONS = [
  { value: 'FALSE_INFO', label: '허위 · 과장된 내용이에요' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용이 있어요' },
  { value: 'EXCESSIVE_PERSONAL_INFO', label: '개인정보를 과하게 요구해요' },
  { value: 'ETC', label: '기타' },
] as const satisfies readonly { value: ReportReason; label: string }[]

const REPORT_DETAIL_MAX_LENGTH = 300

type PostingReportDialogProps = {
  postingId: string
  postingTitle: string
}

function PostingReportDialog({ postingId, postingTitle }: PostingReportDialogProps) {
  const detailId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const { reason, detail, changeReason, changeDetail, canSubmit, isPending, submit, reset } =
    usePostingReportForm({ postingId, onClose: closeDialog })

  // 다시 열 때 빈 상태로 시작하도록 닫을 때 입력 초기화
  function closeDialog() {
    setIsOpen(false)
    reset()
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (nextIsOpen) {
      setIsOpen(true)
      return
    }

    // 닫아도 요청은 취소되지 않아 응답 전까지 닫기 차단
    if (isPending) {
      return
    }

    closeDialog()
  }

  function handleReasonChange(value: string) {
    const selectedReason = REPORT_REASONS.find((reportReason) => reportReason.value === value)

    if (selectedReason) {
      changeReason(selectedReason.value)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-8 shrink-0 cursor-pointer items-center rounded-s px-padding-s text-label2 font-bold text-neutral-subtle underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          신고하기
        </button>
      </DialogTrigger>
      <DialogContent>
        <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-gap-xl">
          <DialogHeader title="이 공고 신고하기" description={postingTitle} />
          <RadioGroup
            aria-label="신고 사유"
            required
            value={reason ?? ''}
            onValueChange={handleReasonChange}
            className="flex-col gap-gap-m"
          >
            {REPORT_REASONS.map(({ value, label }) => (
              <Radio key={value} value={value}>
                {label}
              </Radio>
            ))}
          </RadioGroup>
          <div className="flex flex-col gap-gap-s">
            <label htmlFor={detailId} className="text-label1 font-semibold text-neutral">
              자세한 내용 (선택)
            </label>
            <TextArea
              id={detailId}
              value={detail}
              onChange={(event) => changeDetail(event.target.value)}
              maxLength={REPORT_DETAIL_MAX_LENGTH}
              placeholder="내용을 입력해 주세요"
            />
          </div>
          <InlineNotice tone="neutral">신고한 사실은 단체에 알려지지 않아요.</InlineNotice>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isPending}>
                취소
              </Button>
            </DialogClose>
            {/* TODO: 요청 중 진행 상태 문구 디자인 확인 후 표시 */}
            <Button variant="critical" type="submit" disabled={!canSubmit}>
              신고하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { PostingReportDialog }

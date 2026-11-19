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

// TODO: 신고 API 확정 후 사유 값을 서버 enum으로 교체
const REPORT_REASONS = [
  { value: 'false-information', label: '허위 · 과장된 내용이에요' },
  { value: 'inappropriate-content', label: '부적절한 내용이 있어요' },
  { value: 'excessive-personal-information', label: '개인정보를 과하게 요구해요' },
  { value: 'other', label: '기타' },
] as const

const REPORT_DETAIL_MAX_LENGTH = 300

type PostingReportDialogProps = {
  postingTitle: string
}

// 닫으면 입력이 해제되어 다시 열 때 빈 상태로 시작
function PostingReportDialog({ postingTitle }: PostingReportDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-8 shrink-0 cursor-pointer items-center rounded-s px-padding-s text-label2 font-bold text-neutral-subtle underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          신고하기
        </button>
      </DialogTrigger>
      <DialogContent>
        <PostingReportForm postingTitle={postingTitle} />
      </DialogContent>
    </Dialog>
  )
}

function PostingReportForm({ postingTitle }: PostingReportDialogProps) {
  const detailId = useId()
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const hasSelectedReason = reason !== ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: 신고 API 연결 후 요청·완료 처리
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-gap-xl">
      <DialogHeader title="이 공고 신고하기" description={postingTitle} />
      <RadioGroup
        aria-label="신고 사유"
        value={reason}
        onValueChange={setReason}
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
          onChange={(event) => setDetail(event.target.value)}
          maxLength={REPORT_DETAIL_MAX_LENGTH}
          placeholder="내용을 입력해 주세요"
        />
      </div>
      <InlineNotice tone="neutral">신고한 사실은 단체에 알려지지 않아요.</InlineNotice>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">취소</Button>
        </DialogClose>
        <Button variant="critical" type="submit" disabled={!hasSelectedReason}>
          신고하기
        </Button>
      </DialogFooter>
    </form>
  )
}

export { PostingReportDialog }

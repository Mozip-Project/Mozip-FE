import CheckIcon from '@/assets/icons/check.svg'
import { Button } from '@/components/ui/Button/button'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import { InlineNotice, InlineNoticeAction } from '@/components/ui/InlineNotice/inlineNotice'
import { TextField } from '@/components/ui/TextField/textField'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProgress,
  DialogSummary,
  DialogTrigger,
} from './dialog'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

const TITLE = '48명 모두 평가를 마쳤어요'
const DESCRIPTION = '서류 평가 마감(10/19) 전까지는 평가를 수정할 수 있어요'

function OpenDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button className="m-6">다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}

function WarningNotice() {
  return (
    <InlineNotice
      tone="warning"
      title="제목"
      action={<InlineNoticeAction>바로가기</InlineNoticeAction>}
      className="w-full"
    >
      안내 문구를 입력해 주세요
    </InlineNotice>
  )
}

type SummaryRowProps = {
  label: string
  value: string
  valueClassName: string
}

function SummaryRow({ label, value, valueClassName }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-gap-s">
      <dt className="min-w-0 text-label2 font-normal break-keep text-neutral-subtle">{label}</dt>
      <dd className={cn('shrink-0 text-right text-label1 font-medium', valueClassName)}>{value}</dd>
    </div>
  )
}

function ConfirmActions() {
  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">계속 둘러보기</Button>
      </DialogClose>
      <Button>지원자 목록으로</Button>
    </DialogFooter>
  )
}

export const Confirm: Story = {
  render: () => (
    <OpenDialog>
      <DialogHeader icon={<CheckIcon />} title={TITLE} description={DESCRIPTION} />
      <DialogSummary>
        <SummaryRow label="합격 안내 · 16명" value="16/16명 전달" valueClassName="text-positive" />
        <SummaryRow
          label="불합격 안내 · 32명"
          value="아직 보내지 않았어요"
          valueClassName="text-neutral-subtle"
        />
      </DialogSummary>
      <WarningNotice />
      <ConfirmActions />
    </OpenDialog>
  ),
}

export const Progress: Story = {
  render: () => (
    <OpenDialog>
      <DialogHeader icon={<CheckIcon />} title={TITLE} description={DESCRIPTION} />
      <DialogProgress label="메일 + MOZIP 알림" valueText="31 / 48명" value={31} max={48} />
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">닫고 계속 작업하기</Button>
        </DialogClose>
      </DialogFooter>
    </OpenDialog>
  ),
}

export const Form: Story = {
  render: () => (
    <OpenDialog>
      <DialogHeader title={TITLE} description={DESCRIPTION} />
      <WarningNotice />
      <TextField
        label="라벨"
        placeholder="이름을 입력하세요"
        helper="도움말 텍스트"
        required
        className="w-full"
      />
      <Checkbox defaultChecked className="w-full">
        체크박스
      </Checkbox>
      <ConfirmActions />
    </OpenDialog>
  ),
}

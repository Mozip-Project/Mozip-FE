'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button/button'
import { Checkbox } from '@/components/ui/Checkbox/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/Dialog/dialog'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { useWithdraw } from '@/features/user/hooks/useWithdraw'
import { ApiError } from '@/lib/apiError'

const WITHDRAWAL_NOTICES = [
  '진행 중인 지원은 모두 취소되고, 지원 내역과 스크랩이 삭제돼요.',
  '운영진으로 소속된 단체에서 나가게 돼요.',
  '탈퇴한 뒤에는 되돌릴 수 없어요.',
] as const

const WITHDRAW_FAILED_MESSAGE = '탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.'

// TODO: 대표자로 있는 단체가 남은 경우(USER_409) 안내 문구 디자인 확인 필요, 지금은 서버 메시지 표시
function getWithdrawErrorMessage(error: Error) {
  return error instanceof ApiError ? error.message : WITHDRAW_FAILED_MESSAGE
}

type WithdrawMutation = ReturnType<typeof useWithdraw>

// 요청 상태를 다이얼로그 밖에 두고, 요청 중에는 Esc·바깥 클릭으로 닫히지 않게 해 중복 요청 방지
function WithdrawalDialog() {
  const withdrawMutation = useWithdraw()

  function preventCloseWhilePending(event: Event) {
    if (withdrawMutation.isPending) {
      event.preventDefault()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="critical" size="m">
          회원 탈퇴
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={preventCloseWhilePending}
        onInteractOutside={preventCloseWhilePending}
        className="px-padding-xxl pt-padding-xxl"
      >
        <WithdrawalConfirmForm withdrawMutation={withdrawMutation} />
      </DialogContent>
    </Dialog>
  )
}

type WithdrawalConfirmFormProps = {
  withdrawMutation: WithdrawMutation
}

function WithdrawalConfirmForm({ withdrawMutation }: WithdrawalConfirmFormProps) {
  const [hasConfirmedNotice, setHasConfirmedNotice] = useState(false)
  const { isPending } = withdrawMutation

  return (
    <>
      <div className="flex w-full flex-col items-start gap-gap-m">
        <DialogHeader
          title="정말 탈퇴하시겠어요?"
          description="탈퇴 전 아래 내용을 확인해 주세요"
        />
        <ul className="w-full rounded-m bg-neutral-weak px-padding-m py-padding-s text-label1 font-normal break-keep text-neutral-muted">
          {WITHDRAWAL_NOTICES.map((notice) => (
            <li key={notice} className="before:content-['·_']">
              {notice}
            </li>
          ))}
        </ul>
        <Checkbox
          checked={hasConfirmedNotice}
          onCheckedChange={(checked) => setHasConfirmedNotice(checked === true)}
        >
          안내를 확인했어요
        </Checkbox>
        {withdrawMutation.error && (
          <InlineNotice tone="critical" role="alert" className="w-full">
            {getWithdrawErrorMessage(withdrawMutation.error)}
          </InlineNotice>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" disabled={isPending}>
            취소
          </Button>
        </DialogClose>
        <Button
          variant="critical"
          disabled={!hasConfirmedNotice || isPending}
          onClick={() => withdrawMutation.mutate()}
        >
          탈퇴하기
        </Button>
      </DialogFooter>
    </>
  )
}

export { WithdrawalDialog }

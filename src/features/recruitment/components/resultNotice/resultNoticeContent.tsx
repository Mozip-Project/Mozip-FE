'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, type Ref } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import UsersIcon from '@/assets/icons/users.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { useResultNoticeSend } from '@/features/recruitment/hooks/useResultNoticeSend'
import {
  INTERVIEW_RESULT_NOTICE_SAMPLE,
  RESULT_NOTICE_SAMPLE,
} from '@/features/recruitment/mocks/resultNoticeSample'
import {
  resultNoticeFormSchema,
  type ResultNoticeFormValues,
} from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeKind,
  type ResultNoticeOverview,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import { countEmailCheckRecipients } from '@/features/recruitment/utils/resultNoticeRecipient'
import {
  getPendingTargets,
  getResultNoticeSendState,
} from '@/features/recruitment/utils/resultNoticeSendState'
import { isOneOf } from '@/utils/isOneOf'
import { DeliveryFailureNotice } from './deliveryFailureNotice'
import { ResultNoticePanel } from './resultNoticePanel'
import { ResultNoticeSendDialog } from './resultNoticeSendDialog'
import { ResultNoticeSummaryBar } from './resultNoticeSummaryBar'
import type { RecipientFocusRequest } from './recipientTable'

const TABS_CLASS = 'flex flex-col gap-gap-xl'

// 처음과 초기화 후에는 빈 칸으로 두고 placeholder 표시
const EMPTY_MESSAGES = {
  pass: { subject: '', body: '' },
  fail: { subject: '', body: '' },
} satisfies ResultNoticeFormValues

type ResultNoticeContentProps = {
  kind: ResultNoticeKind
}

// TODO: 결과 안내 API 확정 후 조회로 교체하고 로딩·실패 상태 추가
function ResultNoticeContent({ kind }: ResultNoticeContentProps) {
  const notice: ResultNoticeOverview =
    kind === 'interview' ? INTERVIEW_RESULT_NOTICE_SAMPLE : RESULT_NOTICE_SAMPLE
  const [currentTarget, setCurrentTarget] = useState<ResultNoticeTarget>('pass')
  const [hasReviewedFailMessage, setHasReviewedFailMessage] = useState(false)
  const { control, resetField } = useForm<ResultNoticeFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(resultNoticeFormSchema),
    defaultValues: EMPTY_MESSAGES,
  })
  const [passMessage, failMessage] = useWatch({ control, name: ['pass', 'fail'] })
  const sendFlow = useResultNoticeSend(notice.recipients)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [failedRowFocusRequest, setFailedRowFocusRequest] = useState<RecipientFocusRequest>()

  const recipientCounts = {
    pass: notice.recipients.pass.length,
    fail: notice.recipients.fail.length,
  } satisfies Record<ResultNoticeTarget, number>
  const hasFailRecipients = recipientCounts.fail > 0

  const sendState = getResultNoticeSendState({
    currentTarget,
    hasFailRecipients,
    hasReviewedFailMessage,
    messages: { pass: passMessage, fail: failMessage },
    isSending: sendFlow.progress !== null,
    sentTargets: sendFlow.sentTargets,
  })

  const sendCounts = {
    pass: recipientCounts.pass - countEmailCheckRecipients(notice.recipients.pass),
    fail: recipientCounts.fail - countEmailCheckRecipients(notice.recipients.fail),
  } satisfies Record<ResultNoticeTarget, number>

  const pendingTargets = getPendingTargets({
    currentTarget,
    recipientCounts,
    hasReviewedFailMessage,
    sentTargets: sendFlow.sentTargets,
    failedRecipientsByTarget: sendFlow.failedRecipientsByTarget,
  })

  // 불합격자 탭에 들어가면 불합격 메시지 확인 처리, 탭을 옮기면 실패 행 이동 요청 해제
  function selectTarget(target: ResultNoticeTarget) {
    setCurrentTarget(target)
    setFailedRowFocusRequest(undefined)

    if (target === 'fail') {
      setHasReviewedFailMessage(true)
    }
  }

  function handleTabChange(value: string) {
    if (isOneOf(RESULT_NOTICE_TARGETS, value)) {
      selectTarget(value)
    }
  }

  function handleSendDialogTargetChange(target: ResultNoticeTarget) {
    sendFlow.closeDialog()
    selectTarget(target)
  }

  // 실패 탭으로 이동해 첫 실패 행으로 스크롤
  function showFailedRecipient(target: ResultNoticeTarget) {
    const [firstFailedRecipient] = sendFlow.failedRecipientsByTarget[target]

    sendFlow.closeDialog()
    selectTarget(target)

    if (!firstFailedRecipient) {
      return
    }

    setFailedRowFocusRequest({ recipientId: firstFailedRecipient.id })
  }

  // 발송 창을 연 버튼이 사라졌을 때 focus 받을 지금 탭
  function getSelectedTab() {
    return tabsListRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  }

  // 값과 함께 오류·입력 여부도 처음 상태로 되돌림
  function handleMessageReset(target: ResultNoticeTarget) {
    resetField(`${target}.subject`)
    resetField(`${target}.body`)
  }

  return (
    <Tabs value={currentTarget} onValueChange={handleTabChange} className={TABS_CLASS}>
      <ResultNoticeTabsList
        ref={tabsListRef}
        recipientCounts={recipientCounts}
        pendingTargets={pendingTargets}
      />
      <DeliveryFailureNotice
        currentTarget={currentTarget}
        failedRecipientsByTarget={sendFlow.failedRecipientsByTarget}
        onShowFailed={showFailedRecipient}
      />
      {RESULT_NOTICE_TARGETS.map((target) => (
        <TabsContent key={target} value={target} className="flex flex-col gap-gap-m">
          {target === 'fail' && !hasFailRecipients ? (
            <AllPassedEmptyState />
          ) : (
            <ResultNoticePanel
              kind={kind}
              target={target}
              organizationName={notice.organizationName}
              interviewPeriod={notice.interviewPeriod}
              recipients={notice.recipients[target]}
              control={control}
              onMessageReset={() => handleMessageReset(target)}
              sendResult={sendFlow.results[target]}
              recipientFocusRequest={failedRowFocusRequest}
            />
          )}
        </TabsContent>
      ))}
      <ResultNoticeSummaryBar
        kind={kind}
        state={sendState}
        currentTarget={currentTarget}
        sendCounts={sendCounts}
        onSendRequest={sendFlow.openConfirm}
        onTargetChange={selectTarget}
      />
      <ResultNoticeSendDialog
        kind={kind}
        dialog={sendFlow.dialog}
        recipients={notice.recipients}
        progress={sendFlow.progress}
        results={sendFlow.results}
        onClose={sendFlow.closeDialog}
        onConfirm={() => sendFlow.startSend({ pass: passMessage, fail: failMessage })}
        onTargetChange={handleSendDialogTargetChange}
        onShowFailed={showFailedRecipient}
        getFallbackFocusTarget={getSelectedTab}
      />
    </Tabs>
  )
}

function AllPassedEmptyState() {
  return (
    <EmptyState
      icon={<UsersIcon className="size-7" />}
      title="불합격자가 없어요"
      description="이번 서류 전형은 모두 합격이에요. 합격자 탭에서 합격 안내를 발송해 주세요."
    />
  )
}

type ResultNoticeTabsListProps = {
  ref: Ref<HTMLDivElement>
  recipientCounts: Record<ResultNoticeTarget, number>
  pendingTargets: readonly ResultNoticeTarget[]
}

const PENDING_TAB_STATUS = { tone: 'critical', label: '확인할 내용 있음' } as const

function ResultNoticeTabsList({ ref, recipientCounts, pendingTargets }: ResultNoticeTabsListProps) {
  return (
    <TabsList
      ref={ref}
      aria-label="결과 안내 대상"
      className="relative before:absolute before:inset-x-0 before:bottom-0 before:border-b before:border-neutral-subtle"
    >
      {RESULT_NOTICE_TARGETS.map((target) => (
        <TabsTrigger
          key={target}
          value={target}
          count={recipientCounts[target]}
          status={pendingTargets.includes(target) ? PENDING_TAB_STATUS : undefined}
        >
          {RESULT_NOTICE_TARGET_LABEL[target]}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export { ResultNoticeContent }

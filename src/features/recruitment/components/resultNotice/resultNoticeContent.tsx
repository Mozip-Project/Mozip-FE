'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import UsersIcon from '@/assets/icons/users.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { RESULT_NOTICE_SAMPLE } from '@/features/recruitment/mocks/resultNoticeSample'
import {
  resultNoticeFormSchema,
  type ResultNoticeFormValues,
} from '@/features/recruitment/schemas/resultNoticeMessageSchema'
import {
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import { countEmailCheckRecipients } from '@/features/recruitment/utils/resultNoticeRecipient'
import { getResultNoticeSendState } from '@/features/recruitment/utils/resultNoticeSendState'
import { isOneOf } from '@/utils/isOneOf'
import { ResultNoticePanel } from './resultNoticePanel'
import { ResultNoticeSummaryBar } from './resultNoticeSummaryBar'

const TABS_CLASS = 'flex flex-col gap-gap-xl'

// 처음과 초기화 후에는 빈 칸으로 두고 placeholder 표시
const EMPTY_MESSAGES = {
  pass: { subject: '', body: '' },
  fail: { subject: '', body: '' },
} satisfies ResultNoticeFormValues

// TODO: 결과 안내 API 확정 후 조회로 교체하고 로딩·실패 상태 추가
function ResultNoticeContent() {
  const notice = RESULT_NOTICE_SAMPLE
  const [currentTarget, setCurrentTarget] = useState<ResultNoticeTarget>('pass')
  const [hasReviewedFailMessage, setHasReviewedFailMessage] = useState(false)
  const { control, resetField } = useForm<ResultNoticeFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(resultNoticeFormSchema),
    defaultValues: EMPTY_MESSAGES,
  })
  const [passMessage, failMessage] = useWatch({ control, name: ['pass', 'fail'] })

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
  })

  const sendCounts = {
    pass: recipientCounts.pass - countEmailCheckRecipients(notice.recipients.pass),
    fail: recipientCounts.fail - countEmailCheckRecipients(notice.recipients.fail),
  } satisfies Record<ResultNoticeTarget, number>

  // TODO: 발송 상태 연결 후 미발송·전달 실패도 할 일로 포함
  const hasTodoByTarget = {
    pass: false,
    fail: hasFailRecipients && !hasReviewedFailMessage,
  } satisfies Record<ResultNoticeTarget, boolean>

  // 보고 있지 않은 탭에 할 일이 남았을 때만 표시
  const pendingTargets = RESULT_NOTICE_TARGETS.filter(
    (target) => target !== currentTarget && hasTodoByTarget[target],
  )

  function handleTabChange(value: string) {
    if (!isOneOf(RESULT_NOTICE_TARGETS, value)) {
      return
    }

    setCurrentTarget(value)

    if (value === 'fail') {
      setHasReviewedFailMessage(true)
    }
  }

  // 값과 함께 오류·입력 여부도 처음 상태로 되돌림
  function handleMessageReset(target: ResultNoticeTarget) {
    resetField(`${target}.subject`)
    resetField(`${target}.body`)
  }

  return (
    <Tabs value={currentTarget} onValueChange={handleTabChange} className={TABS_CLASS}>
      <ResultNoticeTabsList recipientCounts={recipientCounts} pendingTargets={pendingTargets} />
      {RESULT_NOTICE_TARGETS.map((target) => (
        <TabsContent key={target} value={target} className="flex flex-col gap-gap-m">
          {target === 'fail' && !hasFailRecipients ? (
            <AllPassedEmptyState />
          ) : (
            <ResultNoticePanel
              target={target}
              organizationName={notice.organizationName}
              recipients={notice.recipients[target]}
              control={control}
              onMessageReset={() => handleMessageReset(target)}
            />
          )}
        </TabsContent>
      ))}
      <ResultNoticeSummaryBar
        state={sendState}
        currentTarget={currentTarget}
        sendCounts={sendCounts}
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
  recipientCounts: Record<ResultNoticeTarget, number>
  pendingTargets: readonly ResultNoticeTarget[]
}

const PENDING_TAB_STATUS = { tone: 'critical', label: '확인할 내용 있음' } as const

function ResultNoticeTabsList({ recipientCounts, pendingTargets }: ResultNoticeTabsListProps) {
  return (
    <TabsList
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

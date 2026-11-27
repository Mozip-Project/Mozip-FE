'use client'

import { useParams } from 'next/navigation'
import { useRef, type Ref } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import UsersIcon from '@/assets/icons/users.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { scrollToStickyBarTop, StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { useResultMessagesQuery } from '@/features/recruitment/api/organizer/queries'
import { useResultNotice } from '@/features/recruitment/hooks/useResultNotice'
import type { ResultNoticeRecipients } from '@/features/recruitment/hooks/useResultNoticeSend'
import {
  RESULT_NOTICE_TARGET_LABEL,
  RESULT_NOTICE_TARGETS,
  type ResultNoticeKind,
  type ResultNoticeTarget,
} from '@/features/recruitment/types'
import {
  formatInterviewPeriod,
  toNoticeVariables,
} from '@/features/recruitment/utils/resultNoticeMessage'
import { toResultNoticeRecipient } from '@/features/recruitment/utils/resultNoticeRecipient'
import type { ResultMessagesFieldsFragment } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { isOneOf } from '@/utils/isOneOf'
import { DeliveryFailureNotice } from './deliveryFailureNotice'
import { RecipientSkeletonTable } from './recipientTable'
import { ResultNoticePanel } from './resultNoticePanel'
import { ResultNoticeSendDialog } from './resultNoticeSendDialog'
import { ResultNoticeSummaryBar } from './resultNoticeSummaryBar'

const SKELETON_CARD_CLASS =
  'flex flex-col gap-gap-l rounded-l border border-neutral-subtle bg-layer-default p-padding-xl'

// flex-1: 페이지 최소 높이(page-min-height)까지 늘려 하단 바(page-bottom-bar)를 화면 아래에 배치
const TABS_CLASS = 'flex flex-1 flex-col gap-gap-xl'

type ResultNoticeContentProps = {
  kind: ResultNoticeKind
}

function ResultNoticeContent({ kind }: ResultNoticeContentProps) {
  const { postingId } = useParams<{ postingId: string }>()
  const { data, isError } = useResultMessagesQuery(postingId)

  if (!data) {
    return <ResultNoticeContentFallback isError={isError} />
  }

  const recipients = {
    pass: data.pass.recipients.map(toResultNoticeRecipient),
    fail: data.fail.recipients.map(toResultNoticeRecipient),
  } satisfies ResultNoticeRecipients

  return (
    <ResultNoticeTabs kind={kind} postingId={postingId} notice={data} recipients={recipients} />
  )
}

// TODO: 로딩·실패·확정 전(MESSAGE_409) 화면 디자인 확인
function ResultNoticeContentFallback({ isError }: { isError: boolean }) {
  if (isError) {
    return (
      <div role="alert">
        <EmptyState icon={<FileTextIcon className="size-7" />} title="조회에 실패했어요" />
      </div>
    )
  }

  // 탭바·작성 카드·받는 사람 카드 자리
  return (
    <div role="status">
      <span className="sr-only">받는 사람을 불러오는 중</span>
      <div aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-xl">
        <div className="flex gap-gap-l border-b border-neutral-subtle pb-padding-s">
          <span className="skeleton-bar h-5 w-16 rounded-full" />
          <span className="skeleton-bar h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-col gap-gap-m">
          <div className="flex gap-gap-l">
            <div className={cn(SKELETON_CARD_CLASS, 'min-w-70 flex-1')}>
              <span className="skeleton-bar h-6 w-32 rounded-full" />
              <span className="skeleton-bar h-60 w-full rounded-m" />
            </div>
            <div className={cn(SKELETON_CARD_CLASS, 'w-95 shrink-0')}>
              <span className="skeleton-bar h-4 w-16 rounded-full" />
              <span className="skeleton-bar h-60 w-full rounded-m" />
            </div>
          </div>
          <div className="overflow-hidden rounded-l border border-neutral-subtle bg-layer-default">
            <div className="px-padding-xl py-padding-m">
              <span className="skeleton-bar block h-6 w-24 rounded-full" />
            </div>
            <RecipientSkeletonTable label="받는 사람" />
          </div>
        </div>
      </div>
    </div>
  )
}

type ResultNoticeTabsProps = ResultNoticeContentProps & {
  postingId: string
  // 받는 사람은 화면용으로 바꿔 따로 받음
  notice: ResultMessagesFieldsFragment
  recipients: ResultNoticeRecipients
}

function ResultNoticeTabs({ kind, postingId, notice, recipients }: ResultNoticeTabsProps) {
  const {
    control,
    currentTarget,
    recipientCounts,
    sendCounts,
    hasFailRecipients,
    sendState,
    pendingTargets,
    failedRowFocusRequest,
    sendFlow,
    selectTarget,
    showFailedRecipient,
    resetMessage,
  } = useResultNotice({ postingId, notice, recipients })
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const interviewPeriod = formatInterviewPeriod(notice.posting.interviewTimeRanges)

  // 탭바가 고정된 채 바꾸면 다른 목록 화면과 같이 새 탭 내용 맨 위가 탭바 바로 아래 오도록 스크롤
  function handleTabChange(value: string) {
    if (!isOneOf(RESULT_NOTICE_TARGETS, value)) {
      return
    }

    if (tabsRef.current) {
      scrollToStickyBarTop(tabsRef.current)
    }
    selectTarget(value)
  }

  // 발송 창을 연 버튼이 사라졌을 때 focus 받을 지금 탭
  function getSelectedTab() {
    return tabsListRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  }

  return (
    <Tabs
      ref={tabsRef}
      value={currentTarget}
      onValueChange={handleTabChange}
      className={TABS_CLASS}
    >
      {/* 다른 목록 화면 탭바와 같이 내용 따라 올라가다 화면 위에 고정 */}
      <StickyTopBar>
        <ResultNoticeTabsList
          ref={tabsListRef}
          recipientCounts={recipientCounts}
          pendingTargets={pendingTargets}
        />
      </StickyTopBar>
      <DeliveryFailureNotice
        currentTarget={currentTarget}
        failedRecipientsByTarget={sendFlow.failedRecipientsByTarget}
        onShowFailed={showFailedRecipient}
      />
      <div data-sticky-bar-content="">
        {RESULT_NOTICE_TARGETS.map((target) => (
          <TabsContent key={target} value={target} className="flex flex-col gap-gap-m">
            {target === 'fail' && !hasFailRecipients ? (
              <AllPassedEmptyState />
            ) : (
              <ResultNoticePanel
                target={target}
                organizationName={notice.posting.organization.name}
                interviewPeriod={interviewPeriod}
                variables={toNoticeVariables(notice[target].variables)}
                recipients={recipients[target]}
                control={control}
                onMessageReset={() => resetMessage(target)}
                sendResult={sendFlow.results[target]}
                recipientFocusRequest={failedRowFocusRequest}
              />
            )}
          </TabsContent>
        ))}
      </div>
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
        recipients={recipients}
        progress={sendFlow.progress}
        results={sendFlow.results}
        onClose={sendFlow.closeDialog}
        onConfirm={() => void sendFlow.startSend()}
        onTargetChange={selectTarget}
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

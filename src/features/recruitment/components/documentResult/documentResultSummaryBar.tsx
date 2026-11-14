'use client'

import Link from 'next/link'
import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import type {
  DocumentResultApplicantPage,
  DocumentResultOverview,
} from '@/features/recruitment/types'
import {
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
} from '@/features/recruitment/utils/documentResult'
import { getResultNoticePath } from '@/features/recruitment/utils/recruitmentRoutes'
import { DocumentResultConfirmDialog } from './documentResultConfirmDialog'

type DocumentResultSummaryBarProps = Pick<
  DocumentResultApplicantPage,
  'statusCounts' | 'totalResultCounts'
> & {
  recruitmentId: string
  overview: DocumentResultOverview
}

function DocumentResultSummaryBar({
  recruitmentId,
  statusCounts,
  totalResultCounts,
  overview: { hasInterview, confirmedAt },
}: DocumentResultSummaryBarProps) {
  const primaryActionRef = useRef<HTMLButtonElement>(null)
  const primaryLinkRef = useRef<HTMLAnchorElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isConfirmed = confirmedAt !== null
  const { status, message, canConfirm } = getDocumentResultSummary({
    statusCounts,
    totalResultCounts,
  })
  const hasInterviewStep = hasInterviewStepAfterConfirm(hasInterview, totalResultCounts)

  return (
    <>
      {isConfirmed ? (
        <SummaryBar
          status="next"
          actions={
            <NextStepActions
              recruitmentId={recruitmentId}
              hasInterviewStep={hasInterviewStep}
              primaryActionRef={primaryActionRef}
              primaryLinkRef={primaryLinkRef}
            />
          }
        >
          {getDocumentResultNextStepMessage(hasInterviewStep)}
        </SummaryBar>
      ) : (
        <SummaryBar
          status={status}
          actions={
            <Button
              ref={primaryActionRef}
              size="m"
              disabled={!canConfirm}
              onClick={() => setIsDialogOpen(true)}
            >
              결과 확정하기
            </Button>
          }
        >
          {message}
        </SummaryBar>
      )}
      <DocumentResultConfirmDialog
        recruitmentId={recruitmentId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        hasInterviewStep={hasInterviewStep}
        resultCounts={totalResultCounts}
        // 트리거 없이 열고, 확정 후에는 버튼이 바뀌므로 현재 주요 버튼으로 focus 복귀
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          // 면접 없는 공고는 주요 동작이 안내 페이지 링크
          const primaryAction = primaryLinkRef.current ?? primaryActionRef.current
          primaryAction?.focus()
        }}
      />
    </>
  )
}

type NextStepActionsProps = {
  recruitmentId: string
  hasInterviewStep: boolean
  primaryActionRef: Ref<HTMLButtonElement>
  primaryLinkRef: Ref<HTMLAnchorElement>
}

// TODO: 면접 타임테이블(결제 전이면 패키지 결제) 경로 확정 후 이동 연결
function NextStepActions({
  recruitmentId,
  hasInterviewStep,
  primaryActionRef,
  primaryLinkRef,
}: NextStepActionsProps) {
  const noticePath = getResultNoticePath(recruitmentId)

  if (!hasInterviewStep) {
    return (
      <Button asChild size="m">
        <Link ref={primaryLinkRef} href={noticePath}>
          서류 결과 안내하기
        </Link>
      </Button>
    )
  }

  return (
    <>
      <Button asChild variant="secondary" size="m">
        <Link href={noticePath}>서류 결과만 안내하기</Link>
      </Button>
      <Button ref={primaryActionRef} size="m">
        면접 타임테이블 만들기
      </Button>
    </>
  )
}

export { DocumentResultSummaryBar }

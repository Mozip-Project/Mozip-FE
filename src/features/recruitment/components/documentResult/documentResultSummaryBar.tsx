'use client'

import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import { useIsStuckToBottom } from '@/features/recruitment/hooks/useIsStuckToBottom'
import type {
  DocumentResultApplicantPage,
  DocumentResultOverview,
} from '@/features/recruitment/types'
import {
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
} from '@/features/recruitment/utils/documentResult'
import { cn } from '@/lib/utils'
import { DocumentResultConfirmDialog } from './documentResultConfirmDialog'

// sticky 클래스 bottom-5와 같은 값
const STICKY_BOTTOM_PX = 20
// 하단 여백 20px + 바 높이 74px + 간격 12px
const TOAST_ABOVE_STUCK_BAR_CLASS = 'bottom-[106px]'

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
  const { ref: barRef, isStuck } = useIsStuckToBottom<HTMLDivElement>(STICKY_BOTTOM_PX)
  const primaryActionRef = useRef<HTMLButtonElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isConfirmed = confirmedAt !== null
  const { status, message, canConfirm } = getDocumentResultSummary({
    statusCounts,
    totalResultCounts,
  })
  const hasInterviewStep = hasInterviewStepAfterConfirm(hasInterview, totalResultCounts)

  return (
    // 스크롤 중 화면 하단에 고정, 목록 끝에서는 제자리
    <div
      ref={barRef}
      className={cn(
        'sticky bottom-5 z-10',
        isStuck &&
          'before:pointer-events-none before:absolute before:-inset-x-6 before:-top-8 before:-bottom-5 before:-z-10 before:bg-linear-to-b before:from-static-transparent before:via-static-white before:via-35% before:to-static-white',
      )}
    >
      {isConfirmed ? (
        <SummaryBar
          status="next"
          actions={
            <NextStepActions
              hasInterviewStep={hasInterviewStep}
              primaryActionRef={primaryActionRef}
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
        toastViewportClassName={isStuck ? TOAST_ABOVE_STUCK_BAR_CLASS : undefined}
        // 트리거 없이 열고, 확정 후에는 버튼이 바뀌므로 현재 주요 버튼으로 focus 복귀
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          primaryActionRef.current?.focus()
        }}
      />
    </div>
  )
}

type NextStepActionsProps = {
  hasInterviewStep: boolean
  primaryActionRef: Ref<HTMLButtonElement>
}

// TODO: 면접 타임테이블(결제 전이면 패키지 결제)·서류 결과 안내 경로 확정 후 이동 연결
function NextStepActions({ hasInterviewStep, primaryActionRef }: NextStepActionsProps) {
  if (!hasInterviewStep) {
    return (
      <Button ref={primaryActionRef} size="m">
        서류 결과 안내하기
      </Button>
    )
  }

  return (
    <>
      <Button variant="secondary" size="m">
        서류 결과만 안내하기
      </Button>
      <Button ref={primaryActionRef} size="m">
        면접 타임테이블 만들기
      </Button>
    </>
  )
}

export { DocumentResultSummaryBar }

'use client'

import Link from 'next/link'
import { useRef, useState, type Ref } from 'react'
import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import type { DocumentResultTotals, DocumentReviewQuery } from '@/features/recruitment/types'
import {
  getDocumentResultNextStepMessage,
  getDocumentResultSummary,
  hasInterviewStepAfterConfirm,
} from '@/features/recruitment/utils/documentResult'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import {
  getInterviewTimetablePath,
  getResultNoticePath,
} from '@/features/recruitment/utils/recruitmentRoutes'
import { DocumentResultConfirmDialog } from './documentResultConfirmDialog'

// 목록 길이와 관계없이 화면 하단에 고정, 페이지 래퍼의 page-min-height와 함께 사용
const STICKY_BOTTOM_CLASS = 'page-bottom-bar'

const UNEVALUATED_REVIEW_QUERY = {
  ...parseDocumentReviewQuery({}),
  status: 'pending',
} satisfies DocumentReviewQuery

type DocumentResultSummaryBarProps = {
  postingId: string
  hasInterview: boolean
  isConfirmed: boolean
  totals: DocumentResultTotals
  visibleHoldCount: number
  // 결과 변경 저장 전·저장 중
  isSaving: boolean
}

function DocumentResultSummaryBar({
  postingId,
  hasInterview,
  isConfirmed,
  totals,
  visibleHoldCount,
  isSaving,
}: DocumentResultSummaryBarProps) {
  const primaryActionRef = useRef<HTMLButtonElement>(null)
  const primaryLinkRef = useRef<HTMLAnchorElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { status, message, canConfirm } = getDocumentResultSummary(totals, visibleHoldCount)
  const hasInterviewStep = hasInterviewStepAfterConfirm(hasInterview, totals.passCount)
  // 평가가 남았으면 확정 대신 서류 평가 목록의 평가 전 탭으로 안내
  const hasUnevaluated = totals.totalCount > 0 && !totals.isAllEvaluated

  return (
    <>
      {isConfirmed ? (
        <SummaryBar
          status="next"
          className={STICKY_BOTTOM_CLASS}
          actions={
            <NextStepActions
              postingId={postingId}
              hasInterviewStep={hasInterviewStep}
              primaryLinkRef={primaryLinkRef}
            />
          }
        >
          {getDocumentResultNextStepMessage(hasInterviewStep)}
        </SummaryBar>
      ) : (
        <SummaryBar
          status={status}
          className={STICKY_BOTTOM_CLASS}
          actions={
            hasUnevaluated ? (
              <Button asChild size="m">
                <Link href={getDocumentReviewHref(postingId, UNEVALUATED_REVIEW_QUERY)}>
                  서류 평가하기
                </Link>
              </Button>
            ) : (
              <Button
                ref={primaryActionRef}
                size="m"
                // 저장 전 결과로 확정 요청이 먼저 가지 않도록 저장이 끝날 때까지 막음
                disabled={!canConfirm || isSaving}
                onClick={() => setIsDialogOpen(true)}
              >
                결과 확정하기
              </Button>
            )
          }
        >
          {message}
        </SummaryBar>
      )}
      <DocumentResultConfirmDialog
        postingId={postingId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        hasInterviewStep={hasInterviewStep}
        resultCounts={{
          pass: totals.passCount,
          hold: totals.holdCount,
          fail: totals.failCount,
        }}
        // 트리거 없이 열고, 확정 후에는 버튼이 바뀌므로 현재 주요 버튼으로 focus 복귀
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          // 확정 후 주요 동작은 안내 페이지·타임테이블 링크
          const primaryAction = primaryLinkRef.current ?? primaryActionRef.current
          primaryAction?.focus()
        }}
      />
    </>
  )
}

type NextStepActionsProps = {
  postingId: string
  hasInterviewStep: boolean
  primaryLinkRef: Ref<HTMLAnchorElement>
}

// TODO: 결제 전이면 면접 타임테이블 대신 패키지 결제로 이동, 결제 상태 API 확정 후 분기
function NextStepActions({ postingId, hasInterviewStep, primaryLinkRef }: NextStepActionsProps) {
  const noticePath = getResultNoticePath(postingId)

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
      <Button asChild size="m">
        <Link ref={primaryLinkRef} href={getInterviewTimetablePath(postingId)}>
          면접 타임테이블 만들기
        </Link>
      </Button>
    </>
  )
}

export { DocumentResultSummaryBar }

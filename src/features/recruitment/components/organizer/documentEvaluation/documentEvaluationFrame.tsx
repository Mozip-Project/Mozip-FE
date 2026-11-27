'use client'

import { useParams } from 'next/navigation'
import { Suspense, useRef, type ReactNode } from 'react'
import { ApplicantChipStrip } from '@/components/ui/ApplicantChipStrip/applicantChipStrip'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { useRecruitmentPostingQuery } from '@/features/recruitment/api/organizer/queries'
import {
  DOCUMENT_EVALUATION_BODY_SLOT,
  useApplicantNavigation,
  useDocumentEvaluationChips,
} from '@/features/recruitment/hooks/useDocumentEvaluationChips'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import { useStickyTopBarHeight } from '@/hooks/useStickyTopBarHeight'
import { DocumentEvaluationChipStripSkeleton } from './documentEvaluationSkeleton'

type DocumentEvaluationParams = {
  postingId: string
  applicantId: string
}

type DocumentEvaluationFrameProps = {
  children: ReactNode
}

function DocumentEvaluationFrame({ children }: DocumentEvaluationFrameProps) {
  return (
    <div data-slot={DOCUMENT_EVALUATION_BODY_SLOT} className="flex flex-col gap-gap-xl">
      <StickyTopBar className="-mb-gap-xl pb-gap-xl">
        <MeasuredHeader>
          <Suspense>
            <BackToList />
          </Suspense>
          <Suspense>
            <ClosedNotice />
          </Suspense>
          <Suspense fallback={<DocumentEvaluationChipStripSkeleton />}>
            <ChipStrip />
          </Suspense>
        </MeasuredHeader>
      </StickyTopBar>
      {/* 짧은 지원서로 바뀌어도 잠깐 이전 높이 유지 */}
      <div data-sticky-bar-content="">{children}</div>
    </div>
  )
}

// 평가 패널 고정 위치와 focus 스크롤 여백에 쓸 고정 영역 높이 측정
function MeasuredHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useStickyTopBarHeight(ref)

  return (
    <div ref={ref} className="flex flex-col gap-gap-xl">
      {children}
    </div>
  )
}

function BackToList() {
  const { postingId } = useParams<DocumentEvaluationParams>()
  const listHref = getDocumentReviewHref(postingId, parseDocumentReviewQuery({}))

  return <BackLink href={listHref} label="서류 평가" className="self-start" />
}

// 서류 결과를 확정하면 평가 패널이 읽기 전용
function ClosedNotice() {
  const { postingId } = useParams<DocumentEvaluationParams>()
  const { data: posting } = useRecruitmentPostingQuery(postingId)

  if (!posting?.docResultConfirmedAt) {
    return null
  }

  return (
    <InlineNotice tone="neutral">서류 평가가 마감됐어요. 평가 내용은 볼 수만 있어요.</InlineNotice>
  )
}

function ChipStrip() {
  const { postingId, applicantId: currentId } = useParams<DocumentEvaluationParams>()
  const { applicants = [], isPending, isError } = useDocumentEvaluationChips(postingId)
  const goToApplicant = useApplicantNavigation(postingId)

  if (isPending) {
    return <DocumentEvaluationChipStripSkeleton />
  }

  if (isError) {
    return (
      <p role="alert" className="text-body2 font-semibold text-neutral-muted">
        지원자 목록을 불러오지 못했어요
      </p>
    )
  }

  return (
    <ApplicantChipStrip
      label="지원자 목록"
      applicants={applicants}
      currentId={currentId}
      onSelect={goToApplicant}
    />
  )
}

export { DocumentEvaluationFrame }

'use client'

import { useParams } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
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
    <div className="flex flex-col gap-gap-xl">
      <Suspense>
        <BackToList />
      </Suspense>
      <Suspense>
        <ClosedNotice />
      </Suspense>
      {/* 짧은 지원서로 바뀌어도 잠깐 이전 높이 유지 */}
      <div data-slot={DOCUMENT_EVALUATION_BODY_SLOT} className="flex flex-col gap-gap-xl">
        <Suspense fallback={<DocumentEvaluationChipStripSkeleton />}>
          <ChipStrip />
        </Suspense>
        <div data-sticky-bar-content="">{children}</div>
      </div>
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

  return (
    <StickyTopBar className="-mb-gap-xl pb-gap-xl">
      {isError ? (
        <p role="alert" className="text-body2 font-semibold text-neutral-muted">
          지원자 목록을 불러오지 못했어요
        </p>
      ) : (
        <ApplicantChipStrip
          label="지원자 목록"
          applicants={applicants}
          currentId={currentId}
          onSelect={goToApplicant}
        />
      )}
    </StickyTopBar>
  )
}

export { DocumentEvaluationFrame }

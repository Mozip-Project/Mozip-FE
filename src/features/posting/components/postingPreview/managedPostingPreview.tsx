'use client'

import { useState } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import type { PostingDetail, PostingRecruitmentPhase } from '@/features/posting/types'
import type { PreviewApplicationForm } from '@/features/posting/utils/postingPreview'
import { usePostingApplicationFormQuery } from '@/features/recruitment/api/applicant/queries'
import {
  toApplicationFormPosting,
  type ApplicationFormPosting,
} from '@/features/recruitment/utils/applicationFormPosting'
import { ApplicationFormPreview } from './applicationFormPreview'
import { PostingDetailPreview } from './postingDetailPreview'
import { PostingPreviewTabs } from './postingPreviewDialog'
import { PreviewStage } from './previewStage'

// 포지션 없는 모집은 지원서 하나
const ALL_QUESTIONS_FORM_ID = 'all'

function toPreviewForms({
  positions,
  questions,
}: ApplicationFormPosting): PreviewApplicationForm[] {
  return positions
    ? positions.map((position) => ({
        id: position.id,
        positionName: position.name,
        questions: position.questions,
      }))
    : [{ id: ALL_QUESTIONS_FORM_ID, positionName: null, questions }]
}

type ManagedPostingPreviewProps = {
  detail: PostingDetail
  phase: PostingRecruitmentPhase
}

// 게시한 공고를 지원자 화면 모양으로 표시
function ManagedPostingPreview({ detail, phase }: ManagedPostingPreviewProps) {
  const [now] = useState(() => new Date())

  return (
    <PostingPreviewTabs
      detailPanel={
        <PostingDetailPreview
          detail={detail}
          coverImageUrl={detail.coverImageUrl}
          organization={detail.organization}
          phase={phase}
          now={now}
        />
      }
      applicationPanel={<ManagedApplicationFormPreview postingId={detail.id} />}
    />
  )
}

// 지원서 탭을 열 때 문항 유형·면접 시간 조회
function ManagedApplicationFormPreview({ postingId }: { postingId: string }) {
  const formQuery = usePostingApplicationFormQuery(postingId)

  // TODO: 지원서 탭 조회 실패·로딩 디자인 확인 필요
  if (formQuery.isError) {
    return (
      <PreviewStage>
        <div role="alert">
          <EmptyState
            icon={<FileTextIcon className="size-7" />}
            title="지원서 양식을 불러오지 못했어요"
            className="border-0"
          />
        </div>
      </PreviewStage>
    )
  }
  if (!formQuery.data) {
    return (
      <PreviewStage>
        <p role="status" className="sr-only">
          지원서 양식을 불러오는 중이에요
        </p>
      </PreviewStage>
    )
  }

  const form = toApplicationFormPosting(formQuery.data)

  return <ApplicationFormPreview postingTitle={form.title} forms={toPreviewForms(form)} />
}

export { ManagedPostingPreview }

'use client'

import { useState } from 'react'
import { useManagedPostingQuery } from '@/features/posting/api/organizer/queries'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import type { PostingOrganization, PostingRecruitmentPhase } from '@/features/posting/types'
import {
  getPreviewApplicationForms,
  toPostingPreviewDetail,
} from '@/features/posting/utils/postingPreview'
import { getDaysBetween, getSeoulIsoDate } from '@/utils/date'
import { ApplicationFormPreview } from './applicationFormPreview'
import { PostingDetailPreview } from './postingDetailPreview'
import { PostingPreviewTabs } from './postingPreviewDialog'

type DraftPostingPreviewProps = {
  values: PostingCreateValues
  hasInterview: boolean
  // 아직 저장하지 않은 공고는 null
  postingId: string | null
  // 진행 중인 다른 모집을 뺀 단체 소개, null은 조회 전
  organization: Omit<PostingOrganization, 'ongoingPostings'> | null
  coverImageUrl: string | null
}

// 작성 중인 값을 지원자 화면 모양으로 변환
function DraftPostingPreview({
  values,
  hasInterview,
  postingId,
  organization,
  coverImageUrl,
}: DraftPostingPreviewProps) {
  const [now] = useState(() => new Date())
  // 진행 중인 다른 모집은 저장된 공고 조회로만 알 수 있음, 실패하면 빈 목록
  const { data: savedPosting } = useManagedPostingQuery(postingId)
  const detail = toPostingPreviewDetail(values, hasInterview)
  // 검토 단계 공고 카드와 같이 모집 중인 모습으로 표시
  const phase: PostingRecruitmentPhase | null = detail.recruitmentEndsAt
    ? {
        status: 'open',
        daysLeft: Math.max(getDaysBetween(getSeoulIsoDate(now), detail.recruitmentEndsAt), 0),
      }
    : null

  return (
    <PostingPreviewTabs
      detailPanel={
        <PostingDetailPreview
          detail={detail}
          coverImageUrl={coverImageUrl}
          isCoverImageUnoptimized
          organization={
            organization && {
              ...organization,
              ongoingPostings: (savedPosting?.otherActivePostings ?? []).map(
                ({ id, title, recruitStartAt, recruitEndAt }) => ({
                  postingId: id,
                  title,
                  recruitmentStartsAt: recruitStartAt,
                  recruitmentEndsAt: recruitEndAt,
                }),
              ),
            }
          }
          phase={phase}
          now={now}
        />
      }
      applicationPanel={
        <ApplicationFormPreview
          postingTitle={detail.title}
          forms={getPreviewApplicationForms(values, hasInterview)}
        />
      }
    />
  )
}

export { DraftPostingPreview }

'use client'

import CheckIcon from '@/assets/icons/check.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { JobCard } from '@/components/ui/JobCard/jobCard'
import { useOrganizationQuery } from '@/features/organization/api/organizer/queries'
import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import { DraftPostingPreview } from '@/features/posting/components/postingPreview/draftPostingPreview'
import { PostingPreviewDialog } from '@/features/posting/components/postingPreview/postingPreviewDialog'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { getPositionNames } from '@/features/posting/utils/postingPositions'
import {
  formatRecruitStart,
  getPostingInfoRows,
  getScheduleItems,
} from '@/features/posting/utils/postingReview'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { getDaysBetween, getTodayIsoDate } from '@/utils/calendar'
import {
  FormReview,
  MethodReview,
  PostingInfoReview,
  ScheduleReview,
  type EditableStepId,
} from './postingReviewSections'

type PostingReviewStepProps = {
  values: PostingCreateValues
  hasInterview: boolean
  organizationId: string | null
  postingId: string | null
  onEditStep: (stepId: EditableStepId) => void
}

function PostingReviewStep({
  values,
  hasInterview,
  organizationId,
  postingId,
  onEditStep,
}: PostingReviewStepProps) {
  const positionNames = getPositionNames(values)

  return (
    <div className="flex flex-col gap-gap-xl">
      {values.recruitStartDate && (
        <InlineNotice tone="informative" icon={CheckIcon} title="게시할 준비가 끝났어요">
          공고 게시 시 {formatRecruitStart(values.recruitStartDate, values.recruitStartTime)} 부터
          지원서를 받을 수 있어요. 순위가 밀리면 다시 UP할 수 있어요.
        </InlineNotice>
      )}
      <div className="flex items-start gap-gap-xl">
        <div className="flex min-w-0 flex-1 flex-col gap-gap-l">
          <PostingInfoReview rows={getPostingInfoRows(values)} onEdit={() => onEditStep('info')} />
          <ScheduleReview
            items={getScheduleItems(values, hasInterview)}
            onEdit={() => onEditStep('schedule')}
          />
          <MethodReview positionNames={positionNames} onEdit={() => onEditStep('method')} />
          <FormReview
            questionSets={values.questionSets}
            positionNames={positionNames}
            hasInterview={hasInterview}
            onEdit={() => onEditStep('form')}
          />
        </div>
        <PostingPreview
          values={values}
          hasInterview={hasInterview}
          organizationId={organizationId}
          postingId={postingId}
        />
      </div>
    </div>
  )
}

function PostingPreview({
  values,
  hasInterview,
  organizationId,
  postingId,
}: Omit<PostingReviewStepProps, 'onEditStep'>) {
  const { data: organization } = useOrganizationQuery(organizationId)
  const thumbnailSrc = useObjectUrl(values.mainImage) ?? values.savedMainImageUrl ?? undefined
  const daysLeft = values.recruitEndDate
    ? getDaysBetween(getTodayIsoDate(), values.recruitEndDate)
    : null

  return (
    <section className="flex w-70 shrink-0 flex-col gap-gap-m rounded-l border border-neutral-subtle bg-layer-default p-padding-l">
      <h2 className="text-label1 font-semibold text-neutral">지원자에게 이렇게 보여요</h2>
      {/* 지원자에게 보이는 모습만 확인, 카드 안 링크·스크랩 조작 차단 */}
      {/* TODO: 모집 상태 문구 API 연결 후 교체 */}
      <div inert>
        <JobCard
          href="/"
          title={values.title.trim()}
          organizationType={organization ? ORGANIZATION_TYPE_LABEL[organization.type] : ''}
          organizationName={organization?.name ?? ''}
          badge={
            daysLeft !== null && (
              <Badge
                {...getRecruitmentStatusBadgeProps({
                  status: 'open',
                  daysLeft: Math.max(daysLeft, 0),
                })}
              />
            )
          }
          tags={getPositionNames(values)}
          isThumbnailUnoptimized
          thumbnailSrc={thumbnailSrc}
        />
      </div>
      <PostingPreviewDialog
        trigger={
          <Button variant="secondary" size="m" className="w-full">
            미리보기
          </Button>
        }
      >
        <DraftPostingPreview
          values={values}
          hasInterview={hasInterview}
          postingId={postingId}
          organization={
            organization
              ? {
                  name: organization.name,
                  logoUrl: organization.logoUrl,
                  type: organization.type,
                  tagline: organization.tagline,
                  fields: organization.fields,
                  keywords: organization.keywords,
                  links: organization.links.map(({ url }) => url),
                }
              : null
          }
          coverImageUrl={thumbnailSrc ?? null}
        />
      </PostingPreviewDialog>
    </section>
  )
}

export { PostingReviewStep }

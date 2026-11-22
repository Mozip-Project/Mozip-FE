'use client'

import CheckIcon from '@/assets/icons/check.svg'
import { Button } from '@/components/ui/Button/button'
import { InlineNotice } from '@/components/ui/InlineNotice/inlineNotice'
import { JobCard } from '@/components/ui/JobCard/jobCard'
import type { PostingCreateValues } from '@/features/posting/schemas/postingCreateValues'
import { getPositionNames } from '@/features/posting/utils/postingPositions'
import {
  formatRecruitStart,
  getPostingInfoRows,
  getPreviewTags,
  getScheduleItems,
} from '@/features/posting/utils/postingReview'
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
  onEditStep: (stepId: EditableStepId) => void
}

function PostingReviewStep({ values, hasInterview, onEditStep }: PostingReviewStepProps) {
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
        <PostingPreview values={values} hasInterview={hasInterview} />
      </div>
    </div>
  )
}

function PostingPreview({ values, hasInterview }: Omit<PostingReviewStepProps, 'onEditStep'>) {
  const thumbnailSrc = useObjectUrl(values.mainImage) ?? undefined
  const daysLeft = values.recruitEndDate
    ? getDaysBetween(getTodayIsoDate(), values.recruitEndDate)
    : null

  return (
    <section className="flex w-70 shrink-0 flex-col gap-gap-m rounded-l border border-neutral-subtle bg-layer-default p-padding-l">
      <h2 className="text-label1 font-semibold text-neutral">지원자에게 이렇게 보여요</h2>
      {/* 지원자에게 보이는 모습만 확인, 카드 안 링크·스크랩 조작 차단 */}
      {/* TODO: 단체 정보·모집 상태 문구 API 연결 후 교체 */}
      <div inert>
        <JobCard
          href="/"
          title={values.title.trim()}
          organizationType="동아리"
          organizationName="UXUX"
          deadlineLabel={daysLeft === null ? '모집중' : `모집중 D-${Math.max(daysLeft, 0)}`}
          tags={getPreviewTags(values, hasInterview)}
          thumbnailSrc={thumbnailSrc}
        />
      </div>
      {/* TODO: 지원자 화면 미리보기 디자인 확정 후 연결 */}
      <Button variant="secondary" size="m" className="w-full">
        미리보기
      </Button>
    </section>
  )
}

export { PostingReviewStep }

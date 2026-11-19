import { Button } from '@/components/ui/Button/button'
import type { PostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { formatMonthDayTimeWithWeekday } from '@/utils/date'
import { PostingApplyBarReveal } from './postingApplyBarReveal'
import { HEADER_APPLY_CTA_ID } from './postingDetailHeader'
import { RecruitmentStatusBadge } from './recruitmentStatusBadge'

type PostingApplyBarProps = {
  title: string
  recruitmentEndsAt: string
  phase: PostingRecruitmentPhase
}

// 운영진 SummaryBar와 같은 틀, 모집 중에만 쓰여 버튼은 [지원하기] 고정
function PostingApplyBar({ title, recruitmentEndsAt, phase }: PostingApplyBarProps) {
  return (
    <PostingApplyBarReveal targetId={HEADER_APPLY_CTA_ID}>
      <div className="flex items-center gap-gap-l rounded-l border border-neutral-subtle bg-layer-default px-padding-xl py-padding-m shadow-floating">
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs">
          <p className="truncate text-body1 font-semibold text-neutral">{title}</p>
          <p className="text-label2 font-medium text-neutral-subtle">
            {formatMonthDayTimeWithWeekday(recruitmentEndsAt)} 마감
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-gap-s">
          <RecruitmentStatusBadge phase={phase} />
          {/* TODO: 지원서 작성 경로 확정 후 이동 연결 */}
          <Button size="m">지원하기</Button>
        </div>
      </div>
    </PostingApplyBarReveal>
  )
}

export { PostingApplyBar }

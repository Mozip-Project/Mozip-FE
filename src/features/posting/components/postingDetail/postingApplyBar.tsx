import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import type { PostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { getPostingApplyPath } from '@/features/posting/utils/postingRoutes'
import { formatMonthDayTimeWithWeekday } from '@/utils/date'
import { PostingApplyBarReveal } from './postingApplyBarReveal'
import { RecruitmentStatusBadge } from './recruitmentStatusBadge'

// 헤더의 지원 버튼 감싸는 요소 id, 화면 밖으로 나가면 하단 바 표시
const HEADER_APPLY_CTA_ID = 'posting-header-apply-cta'

type PostingApplyBarProps = {
  postingId: string
  title: string
  recruitmentEndsAt: string
  phase: PostingRecruitmentPhase
}

function PostingApplyBar({ postingId, title, recruitmentEndsAt, phase }: PostingApplyBarProps) {
  return (
    <PostingApplyBarReveal targetId={HEADER_APPLY_CTA_ID}>
      <div className="flex items-center gap-gap-l rounded-l border border-neutral-subtle bg-layer-default px-padding-xl py-padding-m shadow-floating">
        <div className="flex min-w-0 flex-1 flex-col gap-gap-xxs">
          <div className="flex items-center gap-gap-s">
            <p className="truncate text-body1 font-semibold text-neutral">{title}</p>
            <RecruitmentStatusBadge phase={phase} />
          </div>

          <p className="text-label2 font-medium text-neutral-subtle">
            {formatMonthDayTimeWithWeekday(recruitmentEndsAt)} 마감
          </p>
        </div>

        <Button asChild size="m">
          <Link href={getPostingApplyPath(postingId)}>지원하기</Link>
        </Button>
      </div>
    </PostingApplyBarReveal>
  )
}

export { HEADER_APPLY_CTA_ID, PostingApplyBar }

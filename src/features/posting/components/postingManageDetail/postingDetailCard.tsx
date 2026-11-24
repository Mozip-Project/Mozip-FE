import { useId } from 'react'
import { Badge } from '@/components/ui/Badge/badge'
import { PostingSummary } from '@/features/posting/components/postingDetail/postingSummary'
import type { PostingDetail, PostingRecruitmentPhase } from '@/features/posting/types'
import {
  getRecruitmentStatusBadgeProps,
  getScheduleBadgeProps,
} from '@/features/posting/utils/scheduleBadge'

type PostingDetailCardProps = {
  detail: PostingDetail
  phase: PostingRecruitmentPhase
}

// 모집 중에만 게시 마감 D-day, 그 외는 지원자 화면과 같은 모집 예정·마감 표시
// TODO: 마감 이후 단계의 배지 디자인 확인 필요
function getPostingBadgeProps(phase: PostingRecruitmentPhase) {
  if (phase.status === 'open') {
    return getScheduleBadgeProps(phase.daysLeft, '게시 마감')
  }
  return getRecruitmentStatusBadgeProps(phase)
}

function PostingDetailCard({ detail, phase }: PostingDetailCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-1 flex-col gap-gap-m rounded-l border border-neutral-muted bg-layer-default p-padding-xl desktop:self-stretch"
    >
      <div className="flex items-center justify-between gap-gap-s">
        <h2 id={titleId} className="text-body1 font-semibold text-neutral">
          공고 상세 내용
        </h2>
        <Badge {...getPostingBadgeProps(phase)} />
      </div>
      {/* 지원자 공고 상세와 같은 행 구성 */}
      <PostingSummary detail={detail} />
    </section>
  )
}

export { PostingDetailCard }

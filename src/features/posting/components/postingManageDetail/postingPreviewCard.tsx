import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { JobCard } from '@/components/ui/JobCard/jobCard'
import { ORGANIZATION_TYPE_LABEL } from '@/features/organization/utils/organizationProfile'
import type { PostingDetail, PostingRecruitmentPhase } from '@/features/posting/types'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'

type PostingPreviewCardProps = {
  detail: PostingDetail
  phase: PostingRecruitmentPhase
}

// 전체 공고 카드와 같은 구성, 태그는 포지션
function PostingPreviewCard({ detail, phase }: PostingPreviewCardProps) {
  return (
    <section className="flex shrink-0 flex-col gap-gap-m self-start rounded-l border border-neutral-muted bg-layer-default p-padding-l">
      <div className="flex items-start justify-between">
        <h2 className="text-body1 font-semibold text-neutral">공고 미리보기</h2>
        {/* TODO: 공고 미리보기 화면 디자인 확정 후 연결 */}
        <button
          type="button"
          aria-label="공고 미리보기 열기"
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-xs text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          <ChevronRightIcon aria-hidden className="size-6" />
        </button>
      </div>
      {/* 지원자에게 보이는 모습만 확인, 카드 안 링크·스크랩 조작 차단 */}
      {/* TODO: 지원자 공고 상세 경로가 생기면 href 교체 */}
      <div inert className="w-70.5">
        <JobCard
          href="/"
          title={detail.title}
          organizationType={ORGANIZATION_TYPE_LABEL[detail.organization.type]}
          organizationName={detail.organization.name}
          tags={detail.positions.map(({ name }) => name)}
          thumbnailSrc={detail.coverImageUrl ?? undefined}
          badge={<Badge {...getRecruitmentStatusBadgeProps(phase)} />}
        />
      </div>
    </section>
  )
}

export { PostingPreviewCard }

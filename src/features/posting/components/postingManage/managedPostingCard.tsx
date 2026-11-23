import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import type { ManagedPosting } from '@/features/posting/types'
import { RecruitmentStageGuide } from '@/features/recruitment/components/organizer/recruitmentStage/recruitmentStageGuide'
import { RecruitmentStepper } from '@/features/recruitment/components/organizer/recruitmentStage/recruitmentStepper'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { DraftPostingMenu } from './draftPostingMenu'
import { PostingUpDialog } from './postingUpDialog'

type ManagedPostingCardProps = {
  // UP 팝업의 잔여 횟수 조회용
  organizationId: string
  posting: ManagedPosting
}

function ManagedPostingCard({ organizationId, posting }: ManagedPostingCardProps) {
  const { id, title, progress } = posting
  // 종료된 공고는 다음 할 일이 없어 안내 바 제외
  const hasNextAction = posting.status !== 'closed'

  return (
    <article className="flex flex-col gap-5 rounded-l border border-neutral-weak bg-layer-default p-padding-xl">
      <header className="flex min-h-10 items-center gap-gap-m">
        <h2 className="min-w-0 flex-1 text-heading2 font-bold break-words break-keep text-neutral">
          {title}
        </h2>
        <ManagedPostingActions organizationId={organizationId} posting={posting} />
      </header>
      <RecruitmentStepper progress={progress} />
      {hasNextAction && <RecruitmentStageGuide postingId={id} title={title} progress={progress} />}
    </article>
  )
}

function ManagedPostingActions({ organizationId, posting }: ManagedPostingCardProps) {
  const { id, title } = posting

  switch (posting.status) {
    case 'published': {
      // 최신순 순위와 UP은 지원 접수 중인 공고에만 표시
      const upRank = posting.canUp ? posting.latestRank : null

      return (
        <>
          {upRank !== null && (
            <p className="shrink-0 text-label2 font-medium text-neutral-subtle">
              최신순 {upRank}위
            </p>
          )}
          <div className="flex shrink-0 items-center gap-gap-xs">
            {upRank !== null && (
              <PostingUpDialog
                organizationId={organizationId}
                postingId={id}
                title={title}
                latestRank={upRank}
              />
            )}
            <Button asChild variant="secondary" size="s">
              <Link href={getPostingManageDetailPath(id)} aria-label={`${title} 관리하기`}>
                관리하기
              </Link>
            </Button>
          </div>
        </>
      )
    }
    case 'draft':
      return <DraftPostingMenu postingId={id} title={title} />
    case 'closed':
      // Figma 기준 종료된 공고는 동작 없음
      return null
  }
}

export { ManagedPostingCard }

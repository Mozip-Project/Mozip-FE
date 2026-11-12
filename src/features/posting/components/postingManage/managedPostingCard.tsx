import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import type { ManagedPosting } from '@/features/posting/types'
import { RecruitmentStageGuide } from '@/features/recruitment/components/recruitmentStage/recruitmentStageGuide'
import { RecruitmentStepper } from '@/features/recruitment/components/recruitmentStage/recruitmentStepper'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'
import { DraftPostingMenu } from './draftPostingMenu'
import { PostingUpDialog } from './postingUpDialog'

type ManagedPostingCardProps = {
  posting: ManagedPosting
}

function ManagedPostingCard({ posting }: ManagedPostingCardProps) {
  const { recruitmentId, title, progress } = posting
  // 종료된 공고는 다음 할 일이 없어 안내 바 제외
  const hasNextAction = posting.status !== 'closed'

  return (
    <article className="flex flex-col gap-5 rounded-l border border-neutral-weak bg-layer-default p-padding-xl">
      <header className="flex min-h-10 items-center gap-gap-m">
        <h2 className="min-w-0 flex-1 text-heading2 font-bold break-words break-keep text-neutral">
          {title}
        </h2>
        <ManagedPostingActions posting={posting} />
      </header>
      <RecruitmentStepper progress={progress} />
      {hasNextAction && (
        <RecruitmentStageGuide recruitmentId={recruitmentId} title={title} progress={progress} />
      )}
    </article>
  )
}

function ManagedPostingActions({ posting }: ManagedPostingCardProps) {
  const { id, recruitmentId, title } = posting

  switch (posting.status) {
    case 'published':
      return (
        <>
          <p className="shrink-0 text-label2 font-medium text-neutral-subtle">
            최신순 {posting.latestRank}위
          </p>
          <div className="flex shrink-0 items-center gap-gap-xs">
            <PostingUpDialog postingId={id} title={title} latestRank={posting.latestRank} />
            <Button asChild variant="secondary" size="s">
              <Link
                href={getPostingManageDetailPath(recruitmentId, id)}
                aria-label={`${title} 관리하기`}
              >
                관리하기
              </Link>
            </Button>
          </div>
        </>
      )
    case 'draft':
      return <DraftPostingMenu postingId={id} title={title} />
    case 'closed':
      // Figma 기준 종료된 공고는 동작 없음
      return null
  }
}

export { ManagedPostingCard }

import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import type { BackLink } from '@/components/ui/BackLink/backLink'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getPostingDetailSample } from '@/features/posting/mocks/postingDetailSample'
import { getPostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { getSeoulIsoDate } from '@/utils/date'
import { HEADER_APPLY_CTA_ID, PostingApplyBar } from './postingApplyBar'
import { PostingDetailTabs } from './postingDetailTabs'
import { PostingReportDialog } from './postingReportDialog'
import { PostingSummary } from './postingSummary'
import { RecruitmentStatusBadge } from './recruitmentStatusBadge'
import type { ComponentProps } from 'react'

type PostingDetailContentProps = {
  params: Promise<{ postingId: string }>
  backLink: ComponentProps<typeof BackLink>
}

async function PostingDetailContent({ params, backLink }: PostingDetailContentProps) {
  const { postingId } = await params
  // TODO: 공고 상세 API 확정 후 connection 대신 조회로 교체
  // D-day를 prerender 시점이 아닌 요청 시점 기준으로 계산
  await connection()
  const now = new Date()
  const detail = getPostingDetailSample(postingId, getSeoulIsoDate(now))

  if (!detail) {
    notFound()
  }

  const phase = getPostingRecruitmentPhase(
    detail.recruitmentStartsAt,
    detail.recruitmentEndsAt,
    now,
  )
  // Figma 모집 마감 화면은 신고하기 줄 없음
  const canReport = phase.status !== 'closed'

  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <div className="flex flex-col gap-gap-xl">
        <PageHeader
          backLink={backLink}
          title={detail.title}
          actions={
            <div className="flex items-center gap-gap-m">
              <RecruitmentStatusBadge phase={phase} />
              <div id={HEADER_APPLY_CTA_ID}>
                {/* TODO: 지원서 작성 경로 확정 후 이동 연결 */}
                <Button size="m" disabled={phase.status !== 'open'}>
                  {phase.status === 'upcoming' ? '모집 예정' : '지원하기'}
                </Button>
              </div>
            </div>
          }
        />

        <PostingSummary detail={detail} />

        <PostingDetailTabs detail={detail} now={now} />

        {canReport && (
          <div className="flex items-center gap-gap-s border-t border-neutral-subtle pt-padding-xl">
            <AlertCircleIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
            <p className="text-label2 font-medium text-neutral-subtle">
              공고 내용에 문제가 있나요?
            </p>
            <PostingReportDialog postingId={postingId} postingTitle={detail.title} />
          </div>
        )}
      </div>

      {phase.status === 'open' && (
        <PostingApplyBar
          title={detail.title}
          recruitmentEndsAt={detail.recruitmentEndsAt}
          phase={phase}
        />
      )}
    </div>
  )
}

export { PostingDetailContent }

import { notFound, unstable_rethrow } from 'next/navigation'
import { connection } from 'next/server'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { BackLink } from '@/components/ui/BackLink/backLink'
import { Badge } from '@/components/ui/Badge/badge'
import { Button } from '@/components/ui/Button/button'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getPostingDetail } from '@/features/posting/api/applicant/api'
import { getPostingRecruitmentPhase, toPostingDetail } from '@/features/posting/utils/postingDetail'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import { ApiError } from '@/lib/apiError'
import { HEADER_APPLY_CTA_ID, PostingApplyBar } from './postingApplyBar'
import { PostingApplyButton } from './postingApplyButton'
import { PostingDetailTabs } from './postingDetailTabs'
import { PostingReportPrompt } from './postingReportPrompt'
import { PostingSummary } from './postingSummary'
import type { ComponentProps } from 'react'

const POSTING_NOT_FOUND_CODE = 'POSTING_404'

type PostingDetailContentProps = {
  params: Promise<{ postingId: string }>
  backLink: ComponentProps<typeof BackLink>
}

async function PostingDetailContent({ params, backLink }: PostingDetailContentProps) {
  const { postingId } = await params
  // D-day를 prerender 시점이 아닌 요청 시점 기준으로 계산
  await connection()
  const now = new Date()
  const posting = await getPostingDetailOrNull(postingId)

  if (!posting) {
    return (
      <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
        <BackLink {...backLink} />
        <h1 className="sr-only">공고 상세</h1>
        <div role="alert">
          <EmptyState
            icon={<FileTextIcon className="size-7" />}
            title="공고 상세 정보 조회에 실패했어요"
            className="min-h-162.5 justify-center border-0"
          />
        </div>
      </div>
    )
  }

  const detail = toPostingDetail(posting)
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
          badge={<Badge {...getRecruitmentStatusBadgeProps(phase)} />}
          actions={
            <div id={HEADER_APPLY_CTA_ID}>
              {phase.status === 'open' ? (
                <PostingApplyButton postingId={postingId} />
              ) : (
                <Button size="m" disabled>
                  {phase.status === 'upcoming' ? '모집 예정' : '지원하기'}
                </Button>
              )}
            </div>
          }
        />

        <PostingSummary detail={detail} />

        <PostingDetailTabs
          detail={detail}
          now={now}
          footer={
            canReport && <PostingReportPrompt postingId={postingId} postingTitle={detail.title} />
          }
        />
      </div>

      {phase.status === 'open' && detail.recruitmentEndsAt && (
        <PostingApplyBar
          postingId={postingId}
          title={detail.title}
          recruitmentEndsAt={detail.recruitmentEndsAt}
          phase={phase}
        />
      )}
    </div>
  )
}

async function getPostingDetailOrNull(postingId: string) {
  try {
    return await getPostingDetail(postingId)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof ApiError && error.code === POSTING_NOT_FOUND_CODE) {
      notFound()
    }
    console.error(error)
    return null
  }
}

export { PostingDetailContent }

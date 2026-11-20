import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getPostingDetailSample } from '@/features/posting/mocks/postingDetailSample'
import { getPostingRecruitmentPhase } from '@/features/posting/utils/postingDetail'
import { getSeoulIsoDate } from '@/utils/date'
import { HEADER_APPLY_CTA_ID, PostingApplyBar } from './postingApplyBar'
import { PostingDetailTabs } from './postingDetailTabs'
import { PostingSummary } from './postingSummary'
import { RecruitmentStatusBadge } from './recruitmentStatusBadge'

type PostingDetailContentProps = Pick<PageProps<'/postings/[postingId]'>, 'params'>

async function PostingDetailContent({ params }: PostingDetailContentProps) {
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

  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <div className="flex flex-col gap-gap-xl">
        <PageHeader
          className="gap-gap-s"
          backLink={{ href: '/postings', label: '전체 공고' }}
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

        <div className="flex items-center gap-gap-s border-t border-neutral-subtle pt-padding-xl">
          <AlertCircleIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
          <p className="text-label2 font-medium text-neutral-subtle">공고 내용에 문제가 있나요?</p>
          <button
            type="button"
            className="flex h-8 shrink-0 cursor-pointer items-center rounded-s px-padding-s text-label2 font-bold text-neutral-subtle underline outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            신고하기
          </button>
        </div>
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

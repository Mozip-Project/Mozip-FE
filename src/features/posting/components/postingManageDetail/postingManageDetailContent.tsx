import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button/button'
import { Callout } from '@/components/ui/Callout/callout'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getManagedPostingDetail } from '@/features/posting/api/organizer'
import { getPostingManagePath } from '@/features/recruitment/utils/recruitmentRoutes'
import { PostingDetailCard } from './postingDetailCard'
import { PostingNoticeDialog } from './postingNoticeDialog'
import { PostingPreviewCard } from './postingPreviewCard'

type PostingManageDetailContentProps = Pick<
  PageProps<'/manage/recruitments/[recruitmentId]/postings/[postingId]'>,
  'params'
>

async function PostingManageDetailContent({ params }: PostingManageDetailContentProps) {
  const { recruitmentId, postingId } = await params
  const detail = await getManagedPostingDetail(postingId)

  if (!detail) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        backLink={{ href: getPostingManagePath(recruitmentId), label: '공고 관리' }}
        title={detail.title}
        actions={
          <div className="flex items-center gap-gap-m">
            {/* TODO: 공고 수정 경로 확정 후 연결 */}
            <Button variant="secondary" size="m">
              공고 수정하기
            </Button>
            <PostingNoticeDialog
              postingTitle={detail.title}
              organizationName={detail.preview.organizationName}
              applicantCount={detail.applicantCount}
            />
          </div>
        }
      />
      <div className="flex flex-col gap-gap-m">
        <Callout
          tone="informative"
          title="모집이 연장되면 공고 일정을 직접 수정하고 지원자에게 공지로 알려주세요"
        />
        <div className="flex flex-col gap-gap-l desktop:flex-row desktop:items-start">
          <PostingDetailCard detail={detail} />
          <PostingPreviewCard preview={detail.preview} />
        </div>
      </div>
    </div>
  )
}

export { PostingManageDetailContent }

import { Suspense } from 'react'
import { PostingManageDetailContent } from '@/features/posting/components/postingManageDetail/postingManageDetailContent'

// TODO: 로딩 디자인 확정 후 fallback 추가
export default function RecruitmentPostingDetailPage({
  params,
}: PageProps<'/manage/recruitments/[recruitmentId]/postings/[postingId]'>) {
  return (
    <Suspense>
      <PostingManageDetailContent params={params} />
    </Suspense>
  )
}

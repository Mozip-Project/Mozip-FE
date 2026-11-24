import { Suspense } from 'react'
import { CurrentPostingManageDetail } from '@/features/posting/components/postingManageDetail/currentPostingManageDetail'
import { PostingManageDetailSkeleton } from '@/features/posting/components/postingManageDetail/postingManageDetailSkeleton'

export default function PostingManageDetailPage({
  params,
}: PageProps<'/manage/postings/[postingId]'>) {
  return (
    <Suspense fallback={<PostingManageDetailSkeleton />}>
      <CurrentPostingManageDetail params={params} />
    </Suspense>
  )
}

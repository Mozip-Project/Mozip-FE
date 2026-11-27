import { Suspense } from 'react'
import { PostingManageDetailSkeleton } from '@/features/posting/components/postingManageDetail/postingManageDetailSkeleton'
import { CurrentPostingManageEntry } from '@/features/posting/components/postingManageEntry/currentPostingManageEntry'

export default function PostingManagePage() {
  return (
    <Suspense fallback={<PostingManageDetailSkeleton />}>
      <CurrentPostingManageEntry />
    </Suspense>
  )
}

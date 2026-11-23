import { Suspense } from 'react'
import { PostingDetailContent } from '@/features/posting/components/postingDetail/postingDetailContent'
import { PostingDetailSkeleton } from '@/features/posting/components/postingDetail/postingDetailSkeleton'

const BACK_LINK = { href: '/', label: '전체 공고' } as const

export default function PostingDetailPage({ params }: PageProps<'/postings/[postingId]'>) {
  return (
    <main>
      <Suspense fallback={<PostingDetailSkeleton backLink={BACK_LINK} />}>
        {/* TODO: 모집 마감 공고는 전체 공고 경로에서 안 보이게 처리 */}
        <PostingDetailContent params={params} backLink={BACK_LINK} />
      </Suspense>
    </main>
  )
}

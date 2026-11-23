import { Suspense } from 'react'
import { PostingDetailContent } from '@/features/posting/components/postingDetail/postingDetailContent'
import { PostingDetailSkeleton } from '@/features/posting/components/postingDetail/postingDetailSkeleton'

const BACK_LINK = { href: '/applications', label: '내 지원' } as const

// 내 지원에서 연 공고 상세, 모집 마감 공고는 이 경로로만 확인
export default function ApplicationPostingDetailPage({
  params,
}: PageProps<'/applications/postings/[postingId]'>) {
  return (
    <main>
      <Suspense fallback={<PostingDetailSkeleton backLink={BACK_LINK} />}>
        <PostingDetailContent params={params} backLink={BACK_LINK} />
      </Suspense>
    </main>
  )
}

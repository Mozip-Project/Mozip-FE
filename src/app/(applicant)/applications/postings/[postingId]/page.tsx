import { Suspense } from 'react'
import { PostingDetailContent } from '@/features/posting/components/postingDetail/postingDetailContent'

// 내 지원에서 연 공고 상세, 모집 마감 공고는 이 경로로만 확인
export default function ApplicationPostingDetailPage({
  params,
}: PageProps<'/applications/postings/[postingId]'>) {
  return (
    <main>
      <Suspense>
        <PostingDetailContent
          params={params}
          backLink={{ href: '/applications', label: '내 지원' }}
        />
      </Suspense>
    </main>
  )
}

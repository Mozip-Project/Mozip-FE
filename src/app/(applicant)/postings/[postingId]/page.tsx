import { Suspense } from 'react'
import { PostingDetailContent } from '@/features/posting/components/postingDetail/postingDetailContent'

export default function PostingDetailPage({ params }: PageProps<'/postings/[postingId]'>) {
  return (
    <main>
      <Suspense>
        {/* TODO: 모집 마감 공고는 전체 공고 경로에서 안 보이게 처리(내 지원 경로로만 확인) */}
        <PostingDetailContent
          params={params}
          backLink={{ href: '/postings', label: '전체 공고' }}
        />
      </Suspense>
    </main>
  )
}

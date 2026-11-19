import { Suspense } from 'react'
import { PostingDetailContent } from '@/features/posting/components/postingDetail/postingDetailContent'

export default function PostingDetailPage({ params }: PageProps<'/postings/[postingId]'>) {
  return (
    <main>
      <Suspense>
        <PostingDetailContent params={params} />
      </Suspense>
    </main>
  )
}

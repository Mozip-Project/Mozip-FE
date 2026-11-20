import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { PostingCreateContent } from '@/features/posting/components/postingCreate/postingCreateContent'

export default function PostingCreatePage({ searchParams }: PageProps<'/manage/postings/new'>) {
  return (
    <Suspense fallback={<PageHeader title="공고 작성" />}>
      <PostingCreateContent searchParams={searchParams} />
    </Suspense>
  )
}

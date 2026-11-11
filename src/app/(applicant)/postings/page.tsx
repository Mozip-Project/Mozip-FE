import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { PostingListBoard } from '@/features/posting/components/postingList/postingListBoard'
import { PostingListQueryProvider } from '@/features/posting/components/postingList/postingListQueryContext'
import { PostingSearchField } from '@/features/posting/components/postingList/postingSearchField'

const PAGE_TITLE = '전체 공고'

export default function PostingsPage({ searchParams }: PageProps<'/postings'>) {
  return (
    <main className="flex flex-col gap-12">
      <Suspense fallback={<PageHeader title={PAGE_TITLE} />}>
        <PostingListQueryProvider>
          <PageHeader title={PAGE_TITLE} actions={<PostingSearchField />} />
          <PostingListBoard pathname="/postings" searchParams={searchParams} />
        </PostingListQueryProvider>
      </Suspense>
    </main>
  )
}

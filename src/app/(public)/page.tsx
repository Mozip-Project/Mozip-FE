import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { PostingListBoard } from '@/features/posting/components/postingList/postingListBoard'
import { PostingListHeader } from '@/features/posting/components/postingList/postingListHeader'
import { PostingListQueryProvider } from '@/features/posting/components/postingList/postingListQueryContext'

const PAGE_TITLE = '전체 공고'

export default function HomePage({ searchParams }: PageProps<'/'>) {
  return (
    <main className="flex flex-col gap-12">
      <Suspense fallback={<PageHeader title={PAGE_TITLE} />}>
        <PostingListQueryProvider>
          <PostingListHeader title={PAGE_TITLE} />
          <PostingListBoard searchParams={searchParams} />
        </PostingListQueryProvider>
      </Suspense>
    </main>
  )
}

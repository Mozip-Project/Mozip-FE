import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { CurrentPostingDraftEdit } from '@/features/posting/components/postingDraftEdit/currentPostingDraftEdit'

export default function PostingDraftEditPage({
  params,
}: PageProps<'/manage/postings/[postingId]/edit'>) {
  return (
    <Suspense fallback={<PageHeader title="공고 작성" />}>
      <CurrentPostingDraftEdit params={params} />
    </Suspense>
  )
}

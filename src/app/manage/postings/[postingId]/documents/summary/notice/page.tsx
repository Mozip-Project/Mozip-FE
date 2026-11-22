import { Suspense } from 'react'
import { ResultNoticeContent } from '@/features/recruitment/components/organizer/resultNotice/resultNoticeContent'
import {
  ResultNoticeHeader,
  ResultNoticeHeaderFallback,
} from '@/features/recruitment/components/organizer/resultNotice/resultNoticeHeader'

export default function ResultNoticePage({
  params,
}: PageProps<'/manage/postings/[postingId]/documents/summary/notice'>) {
  return (
    <div className="flex page-min-height flex-col gap-gap-xl">
      <Suspense fallback={<ResultNoticeHeaderFallback kind="document" />}>
        <ResultNoticeHeader kind="document" params={params} />
      </Suspense>
      <ResultNoticeContent kind="document" />
    </div>
  )
}

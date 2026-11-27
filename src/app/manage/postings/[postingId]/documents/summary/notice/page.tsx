import { Suspense } from 'react'
import {
  ResultNoticeContent,
  ResultNoticeContentFallback,
} from '@/features/recruitment/components/organizer/resultNotice/resultNoticeContent'
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
      {/* URL의 공고 ID를 읽어 정적 셸엔 스켈레톤만 포함 */}
      <Suspense fallback={<ResultNoticeContentFallback />}>
        <ResultNoticeContent kind="document" />
      </Suspense>
    </div>
  )
}

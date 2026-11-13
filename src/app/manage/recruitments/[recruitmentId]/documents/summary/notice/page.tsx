import { Suspense } from 'react'
import { ResultNoticeContent } from '@/features/recruitment/components/resultNotice/resultNoticeContent'
import {
  ResultNoticeHeader,
  ResultNoticeHeaderFallback,
} from '@/features/recruitment/components/resultNotice/resultNoticeHeader'

export default function ResultNoticePage({
  params,
}: PageProps<'/manage/recruitments/[recruitmentId]/documents/summary/notice'>) {
  return (
    <div className="flex flex-col gap-gap-xl">
      <Suspense fallback={<ResultNoticeHeaderFallback kind="document" />}>
        <ResultNoticeHeader kind="document" params={params} />
      </Suspense>
      <ResultNoticeContent kind="document" />
    </div>
  )
}

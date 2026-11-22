import { Suspense } from 'react'
import { ResultNoticeContent } from '@/features/recruitment/components/organizer/resultNotice/resultNoticeContent'
import {
  ResultNoticeHeader,
  ResultNoticeHeaderFallback,
} from '@/features/recruitment/components/organizer/resultNotice/resultNoticeHeader'

export default function InterviewResultNoticePage({
  params,
}: PageProps<'/manage/postings/[postingId]/interviews/timetable/notice'>) {
  return (
    <div className="flex page-min-height flex-col gap-gap-xl">
      <Suspense fallback={<ResultNoticeHeaderFallback kind="interview" />}>
        <ResultNoticeHeader kind="interview" params={params} />
      </Suspense>
      <ResultNoticeContent kind="interview" />
    </div>
  )
}

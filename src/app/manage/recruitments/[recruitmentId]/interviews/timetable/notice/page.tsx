import { Suspense } from 'react'
import { ResultNoticeContent } from '@/features/recruitment/components/resultNotice/resultNoticeContent'
import {
  ResultNoticeHeader,
  ResultNoticeHeaderFallback,
} from '@/features/recruitment/components/resultNotice/resultNoticeHeader'

export default function InterviewResultNoticePage({
  params,
}: PageProps<'/manage/recruitments/[recruitmentId]/interviews/timetable/notice'>) {
  return (
    <div className="flex flex-col gap-gap-xl">
      <Suspense fallback={<ResultNoticeHeaderFallback kind="interview" />}>
        <ResultNoticeHeader kind="interview" params={params} />
      </Suspense>
      <ResultNoticeContent kind="interview" />
    </div>
  )
}

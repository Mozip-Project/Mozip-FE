import { Suspense } from 'react'
import {
  ResultNoticeContent,
  ResultNoticeContentFallback,
} from '@/features/recruitment/components/organizer/resultNotice/resultNoticeContent'
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
      {/* URL의 공고 ID를 읽어 정적 셸엔 스켈레톤만 포함 */}
      <Suspense fallback={<ResultNoticeContentFallback />}>
        <ResultNoticeContent kind="interview" />
      </Suspense>
    </div>
  )
}

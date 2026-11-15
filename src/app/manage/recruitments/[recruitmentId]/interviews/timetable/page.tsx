import { Suspense } from 'react'
import { InterviewTimetableContent } from '@/features/recruitment/components/interviewTimetable/interviewTimetableContent'

export default function InterviewTimetablePage({
  params,
}: PageProps<'/manage/recruitments/[recruitmentId]/interviews/timetable'>) {
  return (
    <Suspense>
      <InterviewTimetableContent params={params} />
    </Suspense>
  )
}

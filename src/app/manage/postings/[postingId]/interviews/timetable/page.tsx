import { Suspense } from 'react'
import { InterviewTimetableContent } from '@/features/recruitment/components/organizer/interviewTimetable/interviewTimetableContent'

export default function InterviewTimetablePage({
  params,
}: PageProps<'/manage/postings/[postingId]/interviews/timetable'>) {
  return (
    <Suspense>
      <InterviewTimetableContent params={params} />
    </Suspense>
  )
}

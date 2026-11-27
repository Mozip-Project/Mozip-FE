import { Suspense } from 'react'
import { InterviewTimetableContent } from '@/features/recruitment/components/organizer/interviewTimetable/interviewTimetableContent'

export default function InterviewTimetablePage() {
  return (
    <div className="flex page-min-height flex-col gap-gap-xl">
      {/* 공고 ID(useParams)는 요청 때만 알 수 있어 정적 셸 밖에서 그림 */}
      <Suspense>
        <InterviewTimetableContent />
      </Suspense>
    </div>
  )
}

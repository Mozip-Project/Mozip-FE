import Link from 'next/link'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getInterviewResultNoticePath } from '@/features/recruitment/utils/recruitmentRoutes'

type InterviewTimetableContentProps = {
  params: Promise<{ recruitmentId: string }>
}

// TODO: 면접 타임테이블 화면 구현 전 임시 화면, 확정 후 면접 정보 안내로 이동하는 버튼만 둠
async function InterviewTimetableContent({ params }: InterviewTimetableContentProps) {
  const { recruitmentId } = await params

  return (
    <div className="flex flex-col items-start gap-gap-xl">
      <PageHeader title="면접 타임테이블" />
      <Button asChild size="m">
        <Link href={getInterviewResultNoticePath(recruitmentId)}>서류 결과 안내하기</Link>
      </Button>
    </div>
  )
}

export { InterviewTimetableContent }

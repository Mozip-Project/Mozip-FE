'use client'

import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { ApplicationAnswerCards } from '@/features/recruitment/components/applicationAnswerCards/applicationAnswerCards'
import { AvailabilityCard } from '@/features/recruitment/components/applicationAnswerCards/availabilityCard'
import { DocumentEvaluationApplicationSkeleton } from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationSkeleton'
import { useDocumentEvaluationApplication } from '@/features/recruitment/hooks/useDocumentEvaluationApplication'
import { ApplicantInfoCard } from './applicantInfoCard'

type DocumentEvaluationApplicationProps = {
  postingId: string
  applicationId: string
}

// TODO: 조회 실패 디자인 확정 후 교체, 지금은 모집 관리 목록의 조회 실패와 같은 모양
function ApplicationLoadError({ description }: { description?: string }) {
  return (
    <div role="alert">
      <EmptyState
        icon={<FileTextIcon className="size-7" />}
        title="조회에 실패했어요"
        description={description}
        className="rounded-none border-0"
      />
    </div>
  )
}

function DocumentEvaluationApplication({
  postingId,
  applicationId,
}: DocumentEvaluationApplicationProps) {
  const { application, isError, isNotFound } = useDocumentEvaluationApplication(
    postingId,
    applicationId,
  )

  if (isNotFound) {
    return <ApplicationLoadError description="지원서를 찾을 수 없어요" />
  }

  if (isError) {
    return <ApplicationLoadError />
  }

  if (!application) {
    return <DocumentEvaluationApplicationSkeleton />
  }

  return (
    <>
      <ApplicantInfoCard
        name={application.name}
        school={application.school}
        position={application.positionName}
        phone={application.phone}
        // TODO: 제출 시점 프로필에 이메일 추가 요청 필요
        email={null}
      />
      <ApplicationAnswerCards questionCards={application.questionCards} />
      <AvailabilityCard slots={application.availableSlots} />
    </>
  )
}

export { DocumentEvaluationApplication }

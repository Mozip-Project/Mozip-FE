'use client'

import FileTextIcon from '@/assets/icons/fileText.svg'
import { Badge } from '@/components/ui/Badge/badge'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { useDocumentEvaluationApplication } from '@/features/recruitment/hooks/useDocumentEvaluationApplication'
import { ActivityTable } from './activityTable'
import { AnswerContent } from './answerContent'
import { ApplicantInfoCard } from './applicantInfoCard'
import { AvailabilityCard } from './availabilityCard'
import { DocumentEvaluationApplicationSkeleton } from './documentEvaluationSkeleton'
import { FileLinkList } from './fileLinkList'

type QuestionHeaderContent = {
  number: number
  title: string
  required: boolean
  description: string | null
}

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
      {application.questionCards.map((card) => (
        <section
          key={card.id}
          className="flex min-w-70 flex-col gap-gap-l rounded-l border border-neutral-muted bg-layer-default p-padding-xl"
        >
          <div className="flex flex-col items-start gap-gap-s break-words">
            <Badge tone="brand" variant="weak">
              Q{card.header.number}
            </Badge>
            <h3 className="text-body1 font-semibold text-neutral">
              {card.header.title}
              {card.header.required && (
                <>
                  <span aria-hidden className="ml-gap-xs align-top text-label1 text-critical">
                    *
                  </span>
                  <span className="sr-only">필수</span>
                </>
              )}
            </h3>
            {card.header.description && (
              <p className="text-label2 font-normal text-neutral-subtle">
                {card.header.description}
              </p>
            )}
          </div>
          <hr className="border-neutral-subtle" />
          {card.type === 'text' && (
            <AnswerContent answer={card.answer} maxLength={card.maxLength} />
          )}
          {card.type === 'activity' && (
            <ActivityTable columns={card.columns} activities={card.activities} />
          )}
          {card.type === 'fileLink' && <FileLinkList attachments={card.attachments} />}
        </section>
      ))}
      <AvailabilityCard slots={application.availableSlots} />
    </>
  )
}

export { DocumentEvaluationApplication }
export type { QuestionHeaderContent }

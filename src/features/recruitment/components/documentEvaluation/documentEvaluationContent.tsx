import { notFound } from 'next/navigation'
import { AttachmentCard } from '@/components/ui/AttachmentCard/attachmentCard'
import { BackLink } from '@/components/ui/BackLink/backLink'
import {
  EVALUATION_STRIP_SAMPLE,
  getDocumentEvaluationSample,
} from '@/features/recruitment/mocks/documentEvaluationSample'
import {
  getDocumentReviewHref,
  parseDocumentReviewQuery,
} from '@/features/recruitment/utils/documentReviewQuery'
import { findNextApplicantToEvaluate } from '@/features/recruitment/utils/nextApplicant'
import { AnswerCard } from './answerCard'
import { ApplicantInfoCard } from './applicantInfoCard'
import { AvailabilityCard } from './availabilityCard'
import { DocumentEvaluationChipStrip } from './documentEvaluationChipStrip'
import { DocumentEvaluationPanel } from './documentEvaluationPanel'
import type { Route } from 'next'

type DocumentEvaluationContentProps = Pick<
  PageProps<'/manage/recruitments/[recruitmentId]/documents/[applicantId]'>,
  'params'
>

async function DocumentEvaluationContent({ params }: DocumentEvaluationContentProps) {
  const { recruitmentId, applicantId } = await params
  const applicant = getDocumentEvaluationSample(applicantId)

  if (!applicant) {
    notFound()
  }

  const listHref = getDocumentReviewHref(recruitmentId, parseDocumentReviewQuery({}))
  const next = findNextApplicantToEvaluate(EVALUATION_STRIP_SAMPLE, applicant.id)
  const nextApplicant = next && {
    href: `/manage/recruitments/${recruitmentId}/documents/${next.id}` as Route,
    isWrapped: next.isWrapped,
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <h1 className="sr-only">{applicant.name} 서류 평가</h1>
      <BackLink href={listHref} label="서류 평가" className="self-start" />

      <DocumentEvaluationChipStrip
        recruitmentId={recruitmentId}
        applicants={EVALUATION_STRIP_SAMPLE}
        currentId={applicant.id}
      />

      <div className="flex items-start gap-gap-xl">
        <div className="flex min-w-0 flex-1 flex-col gap-gap-l">
          <ApplicantInfoCard
            name={applicant.name}
            education={applicant.education}
            position={applicant.position}
            phone={applicant.phone}
            email={applicant.email}
          />
          {applicant.answers.map((answer, index) => (
            <AnswerCard
              key={answer.id}
              questionNumber={index + 1}
              question={answer.question}
              answer={answer.answer}
              maxLength={answer.maxLength}
            />
          ))}
          <AvailabilityCard slots={applicant.availableSlots} />
          <AttachmentCard
            title="포트폴리오"
            items={applicant.attachments}
            emptyMessage="첨부한 포트폴리오가 없어요"
          />
        </div>

        <DocumentEvaluationPanel
          key={applicant.id}
          applicantName={applicant.name}
          scoreQuestions={applicant.scoreQuestions}
          savedEvaluation={applicant.savedEvaluation}
          nextApplicant={nextApplicant}
        />
      </div>
    </div>
  )
}

export { DocumentEvaluationContent }

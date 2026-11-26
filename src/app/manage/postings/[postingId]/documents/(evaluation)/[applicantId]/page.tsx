import { Suspense } from 'react'
import { DocumentEvaluationContent } from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationContent'
import { DocumentEvaluationContentSkeleton } from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationSkeleton'

export default function DocumentEvaluationPage({
  params,
}: PageProps<'/manage/postings/[postingId]/documents/[applicantId]'>) {
  return (
    <Suspense fallback={<DocumentEvaluationContentSkeleton />}>
      <DocumentEvaluationContent params={params} />
    </Suspense>
  )
}

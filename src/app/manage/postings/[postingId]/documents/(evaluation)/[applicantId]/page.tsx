import { Suspense } from 'react'
import { DocumentEvaluationContent } from '@/features/recruitment/components/organizer/documentEvaluation/documentEvaluationContent'

export default function DocumentEvaluationPage({
  params,
}: PageProps<'/manage/postings/[postingId]/documents/[applicantId]'>) {
  return (
    <Suspense>
      <DocumentEvaluationContent params={params} />
    </Suspense>
  )
}

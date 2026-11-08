import { Suspense } from 'react'
import { DocumentEvaluationContent } from '@/features/recruitment/components/documentEvaluation/documentEvaluationContent'

export default function DocumentEvaluationPage({
  params,
}: PageProps<'/manage/recruitments/[recruitmentId]/documents/[applicantId]'>) {
  return (
    <Suspense>
      <DocumentEvaluationContent params={params} />
    </Suspense>
  )
}

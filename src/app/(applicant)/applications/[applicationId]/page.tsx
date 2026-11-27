import { Suspense } from 'react'
import { SubmittedApplication } from '@/features/recruitment/components/applicant/submittedApplication/submittedApplication'
import { SubmittedApplicationSkeleton } from '@/features/recruitment/components/applicant/submittedApplication/submittedApplicationSkeleton'

export default function SubmittedApplicationPage({
  params,
}: PageProps<'/applications/[applicationId]'>) {
  return (
    <main>
      <Suspense fallback={<SubmittedApplicationSkeleton />}>
        <SubmittedApplication params={params} />
      </Suspense>
    </main>
  )
}

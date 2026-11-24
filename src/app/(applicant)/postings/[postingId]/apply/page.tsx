import { Suspense } from 'react'
import { ApplicationFormContent } from '@/features/recruitment/components/applicant/applicationForm/applicationFormContent'
import { ApplicationFormSkeleton } from '@/features/recruitment/components/applicant/applicationForm/applicationFormSkeleton'

export default function PostingApplyPage({ params }: PageProps<'/postings/[postingId]/apply'>) {
  return (
    <main>
      <Suspense fallback={<ApplicationFormSkeleton />}>
        <ApplicationFormContent params={params} />
      </Suspense>
    </main>
  )
}

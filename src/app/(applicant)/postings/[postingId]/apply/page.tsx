import { Suspense } from 'react'
import { ApplicationFormContent } from '@/features/recruitment/components/applicant/applicationForm/applicationFormContent'

export default function PostingApplyPage({ params }: PageProps<'/postings/[postingId]/apply'>) {
  return (
    <main>
      <Suspense>
        <ApplicationFormContent params={params} />
      </Suspense>
    </main>
  )
}

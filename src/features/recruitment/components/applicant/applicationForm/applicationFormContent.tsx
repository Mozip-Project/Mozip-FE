import { notFound, unstable_rethrow } from 'next/navigation'
import { getPostingApplicationForm } from '@/features/recruitment/api/applicant/api'
import { toApplicationFormPosting } from '@/features/recruitment/utils/applicationFormPosting'
import { ApiError } from '@/lib/apiError'
import { ApplicationFormError } from './applicationFormError'
import { ApplicationFormGate } from './applicationFormGate'

const POSTING_NOT_FOUND_CODE = 'POSTING_404'

type ApplicationFormContentProps = {
  params: Promise<{ postingId: string }>
}

async function getPostingOrNull(postingId: string) {
  try {
    return await getPostingApplicationForm(postingId)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof ApiError && error.code === POSTING_NOT_FOUND_CODE) {
      notFound()
    }
    console.error(error)
    return null
  }
}

async function ApplicationFormContent({ params }: ApplicationFormContentProps) {
  const { postingId } = await params
  const response = await getPostingOrNull(postingId)

  if (!response) {
    return <ApplicationFormError postingId={postingId} />
  }

  const posting = toApplicationFormPosting(response)

  return (
    <ApplicationFormGate
      postingId={postingId}
      postingTitle={posting.title}
      positions={posting.positions}
      questions={posting.questions}
      requiresProfilePhoto={posting.requiresProfilePhoto}
    />
  )
}

export { ApplicationFormContent }

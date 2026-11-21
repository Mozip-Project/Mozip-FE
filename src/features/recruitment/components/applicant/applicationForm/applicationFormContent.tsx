import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { getPostingDetailSample } from '@/features/posting/mocks/postingDetailSample'
import { APPLICANT_PROFILE_SAMPLE } from '@/features/recruitment/mocks/applicantProfileSample'
import { getSeoulIsoDate } from '@/utils/date'
import { ApplicationForm } from './applicationForm'

type ApplicationFormContentProps = {
  params: Promise<{ postingId: string }>
}

async function ApplicationFormContent({ params }: ApplicationFormContentProps) {
  const { postingId } = await params
  // TODO: 지원서 작성 API 확정 후 connection 대신 조회로 교체
  await connection()
  const detail = getPostingDetailSample(postingId, getSeoulIsoDate(new Date()))

  if (!detail) {
    notFound()
  }

  return (
    <ApplicationForm
      postingId={postingId}
      postingTitle={detail.title}
      positions={detail.application.type === 'byPosition' ? detail.application.positions : null}
      requiresProfilePhoto={detail.requiresProfilePhoto}
      profile={APPLICANT_PROFILE_SAMPLE}
    />
  )
}

export { ApplicationFormContent }

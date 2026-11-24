'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type ComponentProps } from 'react'
import { getApplicationPostingDetailPath } from '@/features/posting/utils/postingRoutes'
import {
  useApplicantProfileQuery,
  usePostingMyApplicationsQuery,
} from '@/features/recruitment/api/applicant/queries'
import { toApplicantProfile } from '@/features/recruitment/utils/applicantProfile'
import { getLatestDraft } from '@/features/recruitment/utils/applicationDraft'
import { markAppliedPositions } from '@/features/recruitment/utils/applicationFormPosting'
import { ApplicationForm } from './applicationForm'
import { ApplicationFormError } from './applicationFormError'
import { ApplicationFormSkeleton } from './applicationFormSkeleton'

type ApplicationFormGateProps = Omit<
  ComponentProps<typeof ApplicationForm>,
  'savedDraft' | 'profile'
>

// 지원 여부, 임시 저장, 프로필을 브라우저에서 조회한 뒤 지원서 표시
function ApplicationFormGate({ positions, ...formProps }: ApplicationFormGateProps) {
  const { postingId } = formProps
  const router = useRouter()
  const {
    data: cachedOrFreshMyApplications,
    dataUpdatedAt: myApplicationsUpdatedAt,
    isError: isMyApplicationsError,
  } = usePostingMyApplicationsQuery(postingId)
  // 들어올 때 캐시에 있던 내 지원서를 받은 시각, 캐시가 없으면 0
  const [cachedMyApplicationsUpdatedAt] = useState(myApplicationsUpdatedAt)
  // 캐시는 다른 화면에 있던 동안의 임시 저장을 몰라 자동 저장이 덮어쓰므로 들어온 뒤 새로 받은 값만 사용
  const myApplications =
    myApplicationsUpdatedAt > cachedMyApplicationsUpdatedAt
      ? cachedOrFreshMyApplications
      : undefined
  const { data: me, isError: isProfileError } = useApplicantProfileQuery()

  const positionsWithApplied =
    positions && myApplications ? markAppliedPositions(positions, myApplications) : positions
  const hasNothingToApply = positionsWithApplied
    ? positionsWithApplied.length > 0 &&
      positionsWithApplied.every((position) => position.appliedAt !== null)
    : (myApplications?.some((application) => application.submittedAt !== null) ?? false)

  // 더 지원할 수 없으면 제출한 지원서 화면으로, 뒤로 가기로 돌아오지 않도록 replace
  useEffect(() => {
    if (hasNothingToApply) {
      router.replace(getApplicationPostingDetailPath(postingId))
    }
  }, [hasNothingToApply, postingId, router])

  // 첫 조회 실패만 실패 화면, 다시 조회가 실패해도 작성 중인 지원서는 유지
  // 임시 저장을 모른 채 빈 지원서로 시작하면 자동 저장이 기존 임시 저장을 덮어써 실패 화면
  if ((!myApplications && isMyApplicationsError) || (!me && isProfileError)) {
    return <ApplicationFormError postingId={postingId} />
  }
  if (!myApplications || !me || hasNothingToApply) {
    return <ApplicationFormSkeleton />
  }
  // 시작값은 처음 그릴 때만 읽어 다시 조회해도 입력 유지
  return (
    <ApplicationForm
      {...formProps}
      positions={positionsWithApplied}
      profile={toApplicantProfile(me)}
      savedDraft={getLatestDraft(myApplications)}
    />
  )
}

export { ApplicationFormGate }

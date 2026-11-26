import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { RecruitmentNav } from './recruitmentNav'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentRecruitmentNav() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <RecruitmentNav savedOrganizationId={savedOrganizationId} />
}

export { CurrentRecruitmentNav }

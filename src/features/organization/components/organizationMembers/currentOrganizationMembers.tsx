import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { OrganizationMembersContent } from './organizationMembersContent'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentOrganizationMembers() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <OrganizationMembersContent savedOrganizationId={savedOrganizationId} />
}

export { CurrentOrganizationMembers }

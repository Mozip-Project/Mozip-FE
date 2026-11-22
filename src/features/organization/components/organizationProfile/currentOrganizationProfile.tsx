import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { OrganizationProfileContent } from './organizationProfileContent'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentOrganizationProfile() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <OrganizationProfileContent savedOrganizationId={savedOrganizationId} />
}

export { CurrentOrganizationProfile }

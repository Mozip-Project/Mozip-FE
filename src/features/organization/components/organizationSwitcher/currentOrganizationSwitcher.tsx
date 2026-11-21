import { getSavedOrganizationId } from '@/features/organization/server/currentOrganizationCookie'
import { OrganizationSwitcher } from './organizationSwitcher'

// 쿠키는 요청 시점 값이라 호출부에서 Suspense로 감싸야 함(cacheComponents)
async function CurrentOrganizationSwitcher() {
  const savedOrganizationId = await getSavedOrganizationId()
  return <OrganizationSwitcher savedOrganizationId={savedOrganizationId} />
}

export { CurrentOrganizationSwitcher }

import { Suspense } from 'react'
import { CurrentOrganizationProfile } from '@/features/organization/components/organizationProfile/currentOrganizationProfile'
import { OrganizationProfileSkeleton } from '@/features/organization/components/organizationProfile/organizationProfileSkeleton'

export default function OrganizationPage() {
  return (
    <Suspense fallback={<OrganizationProfileSkeleton />}>
      <CurrentOrganizationProfile />
    </Suspense>
  )
}

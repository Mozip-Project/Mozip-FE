'use client'

import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { useOrganizationQuery } from '@/features/organization/api/organizer/queries'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { OrganizationProfileForm } from './organizationProfileForm'
import { OrganizationProfileSkeleton } from './organizationProfileSkeleton'

type OrganizationProfileContentProps = {
  savedOrganizationId: string | undefined
}

function OrganizationProfileContent({ savedOrganizationId }: OrganizationProfileContentProps) {
  const { meQuery, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const organizationQuery = useOrganizationQuery(currentOrganizationId)
  const organization = organizationQuery.data
  // 소속 단체가 없으면 헤더(OrganizationSwitcher)가 다른 화면으로 이동
  const hasNoOrganization = meQuery.isSuccess && currentOrganizationId === null

  function handleRetry() {
    if (meQuery.isError) {
      void meQuery.refetch()
      return
    }
    void organizationQuery.refetch()
  }

  // 다시 불러오기가 실패해도 이미 받은 데이터가 있으면 편집 중인 폼 유지
  if (organization) {
    return <OrganizationProfileForm key={organization.id} organization={organization} />
  }
  if (meQuery.isError || organizationQuery.isError) {
    return (
      <div className="flex flex-col gap-gap-xl">
        <PageHeader title="단체 프로필" />
        <OrganizationLoadError message="단체 프로필을 불러오지 못했어요" onRetry={handleRetry} />
      </div>
    )
  }
  if (hasNoOrganization) {
    return null
  }
  return <OrganizationProfileSkeleton />
}

export { OrganizationProfileContent }

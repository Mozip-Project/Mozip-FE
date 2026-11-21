'use client'

import { useTransition } from 'react'
import { OrganizationSelector } from '@/components/ui/Gnb/organizationSelector'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { saveCurrentOrganization } from '@/features/organization/server/saveCurrentOrganization'

type OrganizationSwitcherProps = {
  savedOrganizationId: string | undefined
}

function OrganizationSwitcher({ savedOrganizationId }: OrganizationSwitcherProps) {
  const { organizations, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const [, startTransition] = useTransition()

  function handleOrganizationChange(organizationId: string) {
    if (organizationId === currentOrganizationId) {
      return
    }
    startTransition(() => saveCurrentOrganization(organizationId))
  }

  // TODO: 소속 단체가 없을 때 지원자 홈 이동은 인증 작업에서 처리
  if (!currentOrganizationId) {
    return null
  }

  return (
    <OrganizationSelector
      organizations={organizations}
      currentOrganizationId={currentOrganizationId}
      onOrganizationChange={handleOrganizationChange}
    />
  )
}

export { OrganizationSwitcher }

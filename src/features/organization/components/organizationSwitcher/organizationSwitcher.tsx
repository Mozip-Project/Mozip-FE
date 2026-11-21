'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { OrganizationSelector } from '@/components/ui/Gnb/organizationSelector'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { saveCurrentOrganization } from '@/features/organization/server/saveCurrentOrganization'

// TODO: 회원가입의 단체 생성 화면이 생기면 그 경로로 변경
const NO_ORGANIZATION_REDIRECT_PATH = '/postings'

type OrganizationSwitcherProps = {
  savedOrganizationId: string | undefined
}

function OrganizationSwitcher({ savedOrganizationId }: OrganizationSwitcherProps) {
  const router = useRouter()
  const { meQuery, organizations, currentOrganizationId } =
    useCurrentOrganization(savedOrganizationId)
  const [, startTransition] = useTransition()
  // 헤더가 모든 운영진 화면에 있어 소속 없음 이동을 여기서 한 번만 처리
  const hasNoOrganization = meQuery.isSuccess && currentOrganizationId === null

  useEffect(() => {
    if (hasNoOrganization) {
      router.replace(NO_ORGANIZATION_REDIRECT_PATH)
    }
  }, [hasNoOrganization, router])

  function handleOrganizationChange(organizationId: string) {
    if (organizationId === currentOrganizationId) {
      return
    }
    startTransition(() => saveCurrentOrganization(organizationId))
  }

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

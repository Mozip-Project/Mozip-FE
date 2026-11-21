'use client'

import { useOrganizationMembersQuery } from '@/features/organization/api/organizer/queries'
import {
  MemberTable,
  MemberTableSkeleton,
} from '@/features/organization/components/memberTable/memberTable'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { toOrganizationMembers } from '@/features/organization/utils/organizationMember'
import { OrganizationMembersError } from './organizationMembersError'
import { OrganizationMembersHeader } from './organizationMembersHeader'

type OrganizationMembersContentProps = {
  savedOrganizationId: string | undefined
}

function OrganizationMembersContent({ savedOrganizationId }: OrganizationMembersContentProps) {
  const { meQuery, myUserId, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const membersQuery = useOrganizationMembersQuery(currentOrganizationId)

  const members =
    membersQuery.data && myUserId ? toOrganizationMembers(membersQuery.data, myUserId) : undefined
  const hasError = meQuery.isError || membersQuery.isError
  // 소속 단체가 없으면 헤더(OrganizationSwitcher)가 다른 화면으로 이동
  const hasNoOrganization = meQuery.isSuccess && currentOrganizationId === null

  function handleRetry() {
    if (meQuery.isError) {
      void meQuery.refetch()
      return
    }
    void membersQuery.refetch()
  }

  function renderList() {
    if (hasError) {
      return <OrganizationMembersError onRetry={handleRetry} />
    }
    if (members) {
      return <MemberTable members={members} />
    }
    if (hasNoOrganization) {
      return null
    }
    return <MemberTableSkeleton />
  }

  return (
    <div className="flex flex-col gap-gap-xl">
      <OrganizationMembersHeader memberCount={members?.length} />
      {renderList()}
    </div>
  )
}

export { OrganizationMembersContent }

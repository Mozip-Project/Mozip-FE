import { Suspense } from 'react'
import { MemberTableSkeleton } from '@/features/organization/components/memberTable/memberTable'
import { CurrentOrganizationMembers } from '@/features/organization/components/organizationMembers/currentOrganizationMembers'
import { OrganizationMembersHeader } from '@/features/organization/components/organizationMembers/organizationMembersHeader'

export default function OrganizationMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-gap-xl">
          <OrganizationMembersHeader />
          <MemberTableSkeleton />
        </div>
      }
    >
      <CurrentOrganizationMembers />
    </Suspense>
  )
}

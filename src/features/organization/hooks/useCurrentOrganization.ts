import {
  resolveCurrentOrganizationId,
  toUniqueOrganizations,
} from '@/features/organization/utils/currentOrganization'
import { useMeQuery } from '@/features/user/api/queries'

function useCurrentOrganization(savedOrganizationId: string | undefined) {
  const meQuery = useMeQuery()
  const me = meQuery.data

  return {
    meQuery,
    myUserId: me?.id,
    organizations: me ? toUniqueOrganizations(me.memberships) : [],
    currentOrganizationId: me ? resolveCurrentOrganizationId(savedOrganizationId, me) : null,
  }
}

export { useCurrentOrganization }

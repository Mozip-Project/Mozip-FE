import { useQuery } from '@tanstack/react-query'
import { getOrganizationMembers } from './api'
import { organizationKeys } from './keys'

function useOrganizationMembersQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: () => getOrganizationMembers(organizationId),
  })
}

export { useOrganizationMembersQuery }

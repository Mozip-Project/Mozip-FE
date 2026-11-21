import { skipToken, useQuery } from '@tanstack/react-query'
import { getOrganizationMembers } from './api'
import { organizationKeys } from './keys'

// 현재 단체를 아직 모르면(null) 요청 보류
function useOrganizationMembersQuery(organizationId: string | null) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId ?? ''),
    queryFn: organizationId ? () => getOrganizationMembers(organizationId) : skipToken,
  })
}

export { useOrganizationMembersQuery }

import type { MeQuery } from '@/gql/graphql'

type MyOrganizations = Pick<MeQuery['me'], 'lastOrganization' | 'memberships'>

// 저장 단체 → 서버가 준 단체 → 첫 번째 소속 단체 순, 소속에 없는 단체 ID는 무시
function resolveCurrentOrganizationId(
  savedOrganizationId: string | undefined,
  { lastOrganization, memberships }: MyOrganizations,
) {
  const memberOrganizationIds = memberships.map(({ organization }) => organization.id)
  const candidates = [savedOrganizationId, lastOrganization?.id]

  return (
    candidates.find((id) => id !== undefined && memberOrganizationIds.includes(id)) ??
    memberOrganizationIds[0] ??
    null
  )
}

export { resolveCurrentOrganizationId }

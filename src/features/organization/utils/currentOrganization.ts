import type { MeQuery } from '@/gql/graphql'

type MyOrganizations = Pick<MeQuery['me'], 'lastOrganization' | 'memberships'>
type Memberships = MeQuery['me']['memberships']

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

// 팀별로 같은 단체가 memberships에 여러 번 올 수 있어 단체 ID 기준으로 한 번만 표시
function toUniqueOrganizations(memberships: Memberships) {
  const organizations = new Map(
    memberships.map(({ organization }) => [organization.id, organization] as const),
  )
  return [...organizations.values()]
}

export { resolveCurrentOrganizationId, toUniqueOrganizations }

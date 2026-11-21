import type { MemberRole, OrganizationMember } from '@/features/organization/types'
import type { MemberRole as ServerMemberRole, OrganizationMembersQuery } from '@/gql/graphql'

type ServerMember = OrganizationMembersQuery['members'][number]

function toMemberRole(role: ServerMemberRole): MemberRole {
  switch (role) {
    case 'REPRESENTATIVE':
      return 'owner'
    case 'OPERATOR':
      return 'member'
  }
}

// 팀 없는 단체는 소속팀 빈칸, 순서는 서버 정렬(대표자 먼저, 합류일 오름차순) 유지
function toOrganizationMembers(
  members: readonly ServerMember[],
  myUserId: string,
): OrganizationMember[] {
  return members.map(({ id, role, createdAt, user, team }) => ({
    id,
    name: user.name,
    role: toMemberRole(role),
    team: team?.name ?? '',
    joinedAt: createdAt,
    isMe: user.id === myUserId,
  }))
}

export { toOrganizationMembers }

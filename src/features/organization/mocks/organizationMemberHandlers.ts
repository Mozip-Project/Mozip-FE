import { delay, HttpResponse } from 'msw'
import type { OrganizationMembersQuery, OrganizationMembersQueryVariables } from '@/gql/graphql'
import { graphqlApi } from '@/mocks/graphqlApi'
import { MOCK_ORGANIZATION_ID } from '@/mocks/mockOrganization'
import { MOCK_RESPONSE_DELAY_MS } from '@/mocks/responseDelay'

type ServerMembers = OrganizationMembersQuery['members']

// 이름은 모두 가상, user-1이 내 정보(me)의 회원 ID. 단체 2는 팀 없는 단체
const MEMBERS_BY_ORGANIZATION: Record<string, ServerMembers> = {
  [MOCK_ORGANIZATION_ID]: [
    {
      id: 'member-1',
      role: 'REPRESENTATIVE',
      createdAt: '2025-03-02T10:00:00+09:00',
      user: { id: 'user-1', name: '김하준' },
      team: { name: '기획' },
    },
    {
      id: 'member-2',
      role: 'OPERATOR',
      createdAt: '2025-09-01T10:00:00+09:00',
      user: { id: 'user-2', name: '박지우' },
      team: { name: '디자인' },
    },
    {
      id: 'member-4',
      role: 'OPERATOR',
      createdAt: '2025-09-01T11:00:00+09:00',
      user: { id: 'user-4', name: '최서연' },
      team: { name: '기획' },
    },
    {
      id: 'member-3',
      role: 'OPERATOR',
      createdAt: '2026-03-03T10:00:00+09:00',
      user: { id: 'user-3', name: '이도현' },
      team: { name: '개발' },
    },
  ],
  '2': [
    {
      id: 'member-5',
      role: 'REPRESENTATIVE',
      createdAt: '2024-09-02T10:00:00+09:00',
      user: { id: 'user-5', name: '정예린' },
      team: null,
    },
    {
      id: 'member-6',
      role: 'OPERATOR',
      createdAt: '2025-03-04T10:00:00+09:00',
      user: { id: 'user-1', name: '김하준' },
      team: null,
    },
  ],
}

const organizationMemberHandlers = [
  graphqlApi.query<OrganizationMembersQuery, OrganizationMembersQueryVariables>(
    'OrganizationMembers',
    async ({ variables }) => {
      await delay(MOCK_RESPONSE_DELAY_MS)
      // ID 입력은 string | number로 생성되어 문자열로 통일
      const members = MEMBERS_BY_ORGANIZATION[String(variables.organizationId)]

      if (!members) {
        return HttpResponse.json({
          errors: [{ message: '접근 권한이 없습니다.', extensions: { code: 'COMMON_403' } }],
          data: null,
        })
      }

      return HttpResponse.json({ data: { members } })
    },
  ),
]

export { organizationMemberHandlers }

import { describe, expect, it } from 'vitest'
import { toOrganizationMembers } from './organizationMember'

const representative = {
  id: 'member-1',
  role: 'REPRESENTATIVE' as const,
  createdAt: '2025-03-02T00:00:00Z',
  user: { id: 'user-1', name: '김하준' },
  team: { name: '기획' },
}

const operator = {
  id: 'member-2',
  role: 'OPERATOR' as const,
  createdAt: '2025-09-01T00:00:00Z',
  user: { id: 'user-2', name: '박지우' },
  team: null,
}

describe('toOrganizationMembers', () => {
  it('서버 응답을 운영진 표 항목으로 변환', () => {
    expect(toOrganizationMembers([representative], 'user-9')).toEqual([
      {
        id: 'member-1',
        name: '김하준',
        role: 'owner',
        team: '기획',
        joinedAt: '2025-03-02T00:00:00Z',
        isMe: false,
      },
    ])
  })

  it('운영진 권한은 member', () => {
    expect(toOrganizationMembers([operator], 'user-9')[0]?.role).toBe('member')
  })

  it('팀이 없으면 소속팀 빈칸', () => {
    expect(toOrganizationMembers([operator], 'user-9')[0]?.team).toBe('')
  })

  it('내 회원 ID와 같은 운영진만 나로 표시', () => {
    const members = toOrganizationMembers([representative, operator], 'user-2')

    expect(members.map(({ isMe }) => isMe)).toEqual([false, true])
  })

  it('서버 정렬 순서 유지', () => {
    const members = toOrganizationMembers([representative, operator], 'user-9')

    expect(members.map(({ id }) => id)).toEqual(['member-1', 'member-2'])
  })
})

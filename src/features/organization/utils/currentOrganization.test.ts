import { describe, expect, it } from 'vitest'
import { resolveCurrentOrganizationId } from './currentOrganization'

function createMembership(organizationId: string) {
  return {
    role: 'OPERATOR' as const,
    organization: { id: organizationId, name: `단체 ${organizationId}` },
  }
}

const memberships = [createMembership('1'), createMembership('2')]

describe('resolveCurrentOrganizationId', () => {
  it('저장한 단체가 소속에 있으면 저장한 단체', () => {
    expect(resolveCurrentOrganizationId('2', { lastOrganization: { id: '1' }, memberships })).toBe(
      '2',
    )
  })

  it('저장한 단체가 없으면 서버가 준 단체', () => {
    expect(
      resolveCurrentOrganizationId(undefined, { lastOrganization: { id: '2' }, memberships }),
    ).toBe('2')
  })

  it('저장한 단체가 소속에 없으면 서버가 준 단체', () => {
    expect(resolveCurrentOrganizationId('9', { lastOrganization: { id: '2' }, memberships })).toBe(
      '2',
    )
  })

  it('저장한 단체와 서버가 준 단체가 모두 소속에 없으면 첫 번째 소속 단체', () => {
    expect(resolveCurrentOrganizationId('9', { lastOrganization: { id: '8' }, memberships })).toBe(
      '1',
    )
  })

  it('서버가 준 단체가 없으면 첫 번째 소속 단체', () => {
    expect(resolveCurrentOrganizationId(undefined, { lastOrganization: null, memberships })).toBe(
      '1',
    )
  })

  it('소속 단체가 없으면 null', () => {
    expect(
      resolveCurrentOrganizationId('1', { lastOrganization: { id: '1' }, memberships: [] }),
    ).toBeNull()
  })
})

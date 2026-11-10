import type { OrganizationMember } from '@/features/organization/types'

// TODO: 운영진 목록 API 확정 후 삭제, 이름은 모두 가상 인물
const ORGANIZATION_MEMBERS_SAMPLE = [
  { id: '1', name: '김하준', role: 'owner', team: '기획', joinedAt: '2025-03-02', isMe: true },
  { id: '2', name: '박지우', role: 'member', team: '디자인', joinedAt: '2025-09-01', isMe: false },
  { id: '3', name: '이도현', role: 'member', team: '개발', joinedAt: '2026-03-03', isMe: false },
  { id: '4', name: '최서연', role: 'member', team: '기획', joinedAt: '2025-09-01', isMe: false },
] satisfies OrganizationMember[]

export { ORGANIZATION_MEMBERS_SAMPLE }

type MemberRole = 'owner' | 'member'

type OrganizationProfile = {
  name: string
  isStudentCouncil: boolean
}

type OrganizationMember = {
  id: string
  name: string
  role: MemberRole
  team: string
  joinedAt: string
  isMe: boolean
}

export type { MemberRole, OrganizationMember, OrganizationProfile }

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

// TODO: 이용권 API 명세 확정 후 서버 응답 기준으로 교체
type OrganizationPlan =
  | { status: 'trial'; remainingDays: number }
  | { status: 'trialEnded' }
  | { status: 'package'; name: string }

export type { MemberRole, OrganizationMember, OrganizationPlan, OrganizationProfile }

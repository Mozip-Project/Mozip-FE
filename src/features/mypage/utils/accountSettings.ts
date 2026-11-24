import type { AffiliatedOrganization } from '@/features/mypage/components/accountSettings/organizationSection'
import {
  type SchoolVerificationView,
  toSchoolVerification,
} from '@/features/user/utils/schoolVerification'
import type { MemberRole, MyAccountFieldsFragment } from '@/gql/graphql'
import { maskPhoneNumber } from '@/utils/phone'

type AccountSettings = {
  profile: { name: string; maskedPhone: string }
  schoolVerification: SchoolVerificationView
  organizations: AffiliatedOrganization[]
}

function getMemberRoleLabel(role: MemberRole) {
  switch (role) {
    case 'REPRESENTATIVE':
      return '대표자'
    case 'OPERATOR':
      return '운영진'
  }
}

// 팀 없는 단체는 팀 이름 빈칸, 순서는 서버 응답 유지
function toAccountSettings(account: MyAccountFieldsFragment): AccountSettings {
  return {
    profile: { name: account.name, maskedPhone: maskPhoneNumber(account.phone) },
    schoolVerification: toSchoolVerification(account),
    organizations: account.memberships.map(({ organization, role, team }) => ({
      id: organization.id,
      name: organization.name,
      roleLabel: getMemberRoleLabel(role),
      teamName: team?.name ?? '',
    })),
  }
}

export { toAccountSettings }
export type { AccountSettings }

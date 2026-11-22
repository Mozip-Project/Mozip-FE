import type { AffiliatedOrganization } from '@/features/mypage/components/accountSettings/organizationSection'
import type { MemberRole, MyAccountFieldsFragment } from '@/gql/graphql'
import { maskPhoneNumber } from '@/utils/phone'

type SchoolVerificationView = {
  schoolName: string
  /** 재학증명서로 승인되면 null */
  email: string | null
}

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

// 회원가입에서 인증 승인까지 끝나 항상 있는 값, 스키마상 nullable이라 학교 이름은 빈칸으로 대체
// 목록에 있는 학교면 school.name, 직접 입력한 학교면 schoolName 사용
function toSchoolVerification({
  school,
  schoolVerification,
}: MyAccountFieldsFragment): SchoolVerificationView {
  return {
    schoolName:
      schoolVerification?.school?.name ?? schoolVerification?.schoolName ?? school?.name ?? '',
    email: schoolVerification?.email ?? null,
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
export type { AccountSettings, SchoolVerificationView }

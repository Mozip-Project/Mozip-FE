import type { MyAccountFieldsFragment } from '@/gql/graphql'

type SchoolVerificationView = {
  schoolName: string
  /** 재학증명서로 승인되면 null */
  email: string | null
}

// 회원가입에서 인증 승인까지 끝나 항상 있는 값
function toSchoolVerification({
  school,
  schoolVerification,
}: Pick<MyAccountFieldsFragment, 'school' | 'schoolVerification'>): SchoolVerificationView {
  return {
    schoolName:
      schoolVerification?.school?.name ?? schoolVerification?.schoolName ?? school?.name ?? '',
    email: schoolVerification?.email ?? null,
  }
}

export { toSchoolVerification }
export type { SchoolVerificationView }

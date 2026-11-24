import type { ApplicantProfile } from '@/features/recruitment/types'
import { toSchoolVerification } from '@/features/user/utils/schoolVerification'
import type { ApplicantProfileQuery } from '@/gql/graphql'
import { maskPhoneNumber } from '@/utils/phone'

function toApplicantProfile(me: ApplicantProfileQuery['me']): ApplicantProfile {
  const { schoolName, email } = toSchoolVerification(me)

  return {
    name: me.name,
    savedPhotoUrl: me.profileImageUrl ?? null,
    maskedPhone: maskPhoneNumber(me.phone),
    university: schoolName,
    email,
  }
}

export { toApplicantProfile }

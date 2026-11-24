import { describe, expect, it } from 'vitest'
import type { ApplicantProfileQuery } from '@/gql/graphql'
import { toApplicantProfile } from './applicantProfile'

function createMe(
  overrides: Partial<ApplicantProfileQuery['me']> = {},
): ApplicantProfileQuery['me'] {
  return {
    id: 'user-1',
    name: '김모집',
    phone: '01012345678',
    profileImageUrl: 'https://cdn.example.com/profile.png',
    school: { name: '모집대학교' },
    schoolVerification: {
      schoolName: null,
      email: 'mozip@mozip.ac.kr',
      school: { name: '모집대학교' },
    },
    ...overrides,
  }
}

describe('toApplicantProfile', () => {
  it('전화번호는 가운데를 가리고 인증 학교·이메일을 프로필 카드 값으로 바꾼다', () => {
    expect(toApplicantProfile(createMe())).toEqual({
      name: '김모집',
      savedPhotoUrl: 'https://cdn.example.com/profile.png',
      maskedPhone: '010-****-5678',
      university: '모집대학교',
      email: 'mozip@mozip.ac.kr',
    })
  })

  it('직접 입력한 학교는 입력한 이름, 인증 이메일이 없으면 null', () => {
    const profile = toApplicantProfile(
      createMe({
        profileImageUrl: null,
        school: null,
        schoolVerification: { schoolName: '직접입력대학교', email: null, school: null },
      }),
    )

    expect(profile).toMatchObject({
      savedPhotoUrl: null,
      university: '직접입력대학교',
      email: null,
    })
  })
})

import type { ApplicantProfile } from '@/features/recruitment/types'

// TODO: 지원자 프로필 API 연결 후 삭제, 값은 Figma 지원서 작성 화면 예시
const APPLICANT_PROFILE_SAMPLE = {
  name: '김모집',
  savedPhotoUrl: null,
  maskedPhone: '010-****-5678',
  university: '성균관대학교',
  email: 'mozip@skku.edu',
} satisfies ApplicantProfile

export { APPLICANT_PROFILE_SAMPLE }

import type { OrganizationProfile } from '@/features/organization/types'
import { MOCK_ORGANIZATION_NAME } from '@/mocks/mockOrganization'

// TODO: 단체 프로필 조회 API 확정 후 삭제
const ORGANIZATION_PROFILE_SAMPLE = {
  name: MOCK_ORGANIZATION_NAME,
  isStudentCouncil: false,
} satisfies OrganizationProfile

export { ORGANIZATION_PROFILE_SAMPLE }

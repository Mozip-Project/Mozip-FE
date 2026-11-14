import { ORGANIZATION_PLAN_SAMPLE } from '@/features/organization/mocks/organizationPlanSample'
import { ORGANIZATION_PROFILE_SAMPLE } from '@/features/organization/mocks/organizationProfileSample'
import type { OrganizationPlan, OrganizationProfile } from '@/features/organization/types'

// TODO: 단체 프로필 조회 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getOrganizationProfile(): Promise<OrganizationProfile> {
  return ORGANIZATION_PROFILE_SAMPLE
}

// TODO: 이용권 조회 API 확정 후 실제 요청으로 교체
// eslint-disable-next-line @typescript-eslint/require-await -- API 교체 시 호출부 변경 방지
async function getOrganizationPlan(): Promise<OrganizationPlan> {
  return ORGANIZATION_PLAN_SAMPLE
}

export { getOrganizationPlan, getOrganizationProfile }

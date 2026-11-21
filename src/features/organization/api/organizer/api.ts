import { ORGANIZATION_PLAN_SAMPLE } from '@/features/organization/mocks/organizationPlanSample'
import { ORGANIZATION_PROFILE_SAMPLE } from '@/features/organization/mocks/organizationProfileSample'
import type { OrganizationPlan, OrganizationProfile } from '@/features/organization/types'
import {
  KeywordSuggestionsDocument,
  OrganizationMembersDocument,
  OrganizationProfileDocument,
  UpdateOrganizationDocument,
  type UpdateOrganizationInput,
} from '@/gql/graphql'
import { requestGraphQL } from '@/lib/graphqlClient'

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

async function getOrganizationMembers(organizationId: string) {
  const data = await requestGraphQL(OrganizationMembersDocument, { organizationId })
  return data.members
}

async function getOrganization(organizationId: string) {
  const data = await requestGraphQL(OrganizationProfileDocument, { id: organizationId })
  return data.organization
}

async function updateOrganization(organizationId: string, input: UpdateOrganizationInput) {
  const data = await requestGraphQL(UpdateOrganizationDocument, { id: organizationId, input })
  return data.updateOrganization
}

async function getKeywordSuggestions(query: string) {
  const data = await requestGraphQL(KeywordSuggestionsDocument, { query })
  return data.keywordSuggestions
}

export {
  getKeywordSuggestions,
  getOrganization,
  getOrganizationMembers,
  getOrganizationPlan,
  getOrganizationProfile,
  updateOrganization,
}

import type { OrganizationPlan } from '@/features/organization/types'

// TODO: 이용권 조회 API 확정 후 삭제
const ORGANIZATION_PLAN_SAMPLE = {
  status: 'trial',
  remainingDays: 12,
} satisfies OrganizationPlan

export { ORGANIZATION_PLAN_SAMPLE }

import { cookies } from 'next/headers'

// 결정 기록 018, 단체 ID만 저장하고 역할은 me.memberships에서 조회
const CURRENT_ORGANIZATION_COOKIE = 'mozip_organization_id'

async function getSavedOrganizationId() {
  const cookieStore = await cookies()
  return cookieStore.get(CURRENT_ORGANIZATION_COOKIE)?.value
}

export { CURRENT_ORGANIZATION_COOKIE, getSavedOrganizationId }

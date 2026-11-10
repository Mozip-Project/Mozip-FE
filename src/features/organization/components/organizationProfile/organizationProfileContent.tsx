import { connection } from 'next/server'
import { ORGANIZATION_PROFILE_SAMPLE } from '@/features/organization/api/organizationProfileSample'
import { OrganizationProfileForm } from './organizationProfileForm'

// 링크 입력란 id(crypto.randomUUID)를 prerender가 아닌 요청 시점에 생성
async function OrganizationProfileContent() {
  // TODO: 단체 프로필 조회 API 확정 후 connection 대신 조회로 교체
  await connection()

  return <OrganizationProfileForm profile={ORGANIZATION_PROFILE_SAMPLE} />
}

export { OrganizationProfileContent }

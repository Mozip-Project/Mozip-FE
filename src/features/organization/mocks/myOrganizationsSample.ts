import type { OrganizationOption } from '@/components/ui/Gnb/organizationSelector'
import { ORGANIZATION_PROFILE_SAMPLE } from './organizationProfileSample'

// TODO: 로그인 사용자의 단체 목록·현재 단체 API 확정 후 삭제
const MY_ORGANIZATIONS_SAMPLE = {
  currentOrganizationId: '1',
  organizations: [
    { id: '1', name: ORGANIZATION_PROFILE_SAMPLE.name },
    { id: '2', name: '멋쟁이개발자' },
  ] satisfies OrganizationOption[],
}

export { MY_ORGANIZATIONS_SAMPLE }

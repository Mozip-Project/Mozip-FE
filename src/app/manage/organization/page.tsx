import { Suspense } from 'react'
import { OrganizationProfileContent } from '@/features/organization/components/organizationProfile/organizationProfileContent'

export default function OrganizationPage() {
  return (
    // TODO: 로딩 화면 디자인 확정 후 fallback 추가
    <Suspense>
      <OrganizationProfileContent />
    </Suspense>
  )
}

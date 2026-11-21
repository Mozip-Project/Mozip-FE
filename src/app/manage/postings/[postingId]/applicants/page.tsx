import { Suspense } from 'react'
import {
  ApplicantManagementContent,
  ApplicantManagementContentFallback,
} from '@/features/recruitment/components/applicantManagement/applicantManagementContent'

export default function ApplicantManagementPage() {
  return (
    <div className="flex flex-col gap-gap-xl">
      {/* URL 조건과 결과 확정 여부는 클라이언트에서 조회, 정적 셸에는 제목과 스켈레톤만 포함 */}
      <Suspense fallback={<ApplicantManagementContentFallback />}>
        <ApplicantManagementContent />
      </Suspense>
    </div>
  )
}

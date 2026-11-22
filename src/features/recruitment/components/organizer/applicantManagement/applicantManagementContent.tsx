'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { RecruitmentProgressCard } from '@/features/recruitment/components/organizer/recruitmentStage/recruitmentProgressCard'
import { useApplicantManagementQuery } from '@/features/recruitment/hooks/useApplicantManagement'
import { parseApplicantManagementQuery } from '@/features/recruitment/utils/applicantManagementQuery'
import {
  ApplicantManagementBoard,
  ApplicantManagementBoardPlaceholder,
} from './applicantManagementBoard'
import { ApplicantManagementEmptyState } from './applicantManagementEmptyState'
import {
  ApplicantManagementSkeletonTable,
  ApplicantManagementTable,
} from './applicantManagementTable'

// 서류 평가 취합의 결과 확정과 같은 캐시를 쓰도록 클라이언트에서 조회
// TODO: 조회 실패 상태는 디자인 확정 후 추가
function ApplicantManagementContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const query = parseApplicantManagementQuery(useSearchParams())
  const { data, isPlaceholderData } = useApplicantManagementQuery(postingId, query)

  if (!data) {
    return <ApplicantManagementContentFallback />
  }

  const keyword = query.keyword.trim()

  return (
    <ApplicantManagementBoard
      postingId={postingId}
      query={query}
      tabCounts={data.tabCounts}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      isPending={isPlaceholderData}
      hasInterview={data.progress.hasInterview}
      summary={<RecruitmentProgressCard progress={data.progress} />}
    >
      <ApplicantManagementTable
        applicants={data.applicants}
        progress={data.progress}
        emptyState={<ApplicantManagementEmptyState keyword={keyword} />}
      />
    </ApplicantManagementBoard>
  )
}

function ApplicantManagementContentFallback() {
  return (
    <ApplicantManagementBoardPlaceholder>
      <div className="animate-skeleton-delayed-show">
        <ApplicantManagementSkeletonTable />
      </div>
    </ApplicantManagementBoardPlaceholder>
  )
}

export { ApplicantManagementContent, ApplicantManagementContentFallback }

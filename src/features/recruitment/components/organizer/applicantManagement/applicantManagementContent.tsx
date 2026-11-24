'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useApplicantManagement } from '@/features/recruitment/hooks/useApplicantManagement'
import {
  APPLICANT_ALL_POSITIONS_TAB,
  type ApplicantManagementPage,
  type ApplicantManagementQuery,
} from '@/features/recruitment/types'
import { parseApplicantManagementQuery } from '@/features/recruitment/utils/applicantManagementQuery'
import {
  ApplicantManagementBoard,
  ApplicantManagementBoardPlaceholder,
} from './applicantManagementBoard'
import {
  ApplicantManagementEmptyState,
  ApplicantManagementLoadError,
} from './applicantManagementEmptyState'
import {
  ApplicantManagementSkeletonTable,
  ApplicantManagementTable,
} from './applicantManagementTable'

// 서류 평가 취합의 결과 확정 뒤 함께 갱신하도록 클라이언트에서 조회
function ApplicantManagementContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const query = parseApplicantManagementQuery(useSearchParams())
  const { data, isError, isPlaceholderData } = useApplicantManagement(postingId, query)
  const columns = data && { hasInterview: data.hasInterview, hasPositions: data.hasPositions }

  return (
    <ApplicantManagementBoard
      postingId={postingId}
      query={query}
      positionTabs={data?.positionTabs ?? null}
      currentPage={data?.currentPage ?? query.page}
      totalPages={data?.totalPages ?? 0}
      isPending={isPlaceholderData}
      columns={columns}
    >
      <ApplicantManagementList data={data} isError={isError} query={query} />
    </ApplicantManagementBoard>
  )
}

type ApplicantManagementListProps = {
  data: ApplicantManagementPage | undefined
  isError: boolean
  query: ApplicantManagementQuery
}

// 이전 목록이 없는 실패만 실패 화면, 조회 중은 스켈레톤
function ApplicantManagementList({ data, isError, query }: ApplicantManagementListProps) {
  if (isError) {
    return <ApplicantManagementLoadError />
  }

  if (!data) {
    return (
      <div className="animate-skeleton-delayed-show">
        <ApplicantManagementSkeletonTable />
      </div>
    )
  }

  return (
    <ApplicantManagementTable
      applicants={data.applicants}
      columns={{ hasInterview: data.hasInterview, hasPositions: data.hasPositions }}
      resultPhase={data.resultPhase}
      emptyState={
        <ApplicantManagementEmptyState
          keyword={query.keyword.trim()}
          isPositionSelected={query.status !== APPLICANT_ALL_POSITIONS_TAB}
        />
      }
    />
  )
}

// Suspense 정적 셸용, 조작은 막고 제목만 표시
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

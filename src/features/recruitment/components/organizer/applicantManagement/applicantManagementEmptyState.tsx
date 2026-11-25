import UsersIcon from '@/assets/icons/users.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { RecruitmentBoardEmptyState } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardEmptyState'
import { RecruitmentBoardSearchEmptyState } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardSearchEmptyState'

type ApplicantManagementEmptyStateProps = {
  keyword: string
  isPositionSelected: boolean
}

// 검색어가 있으면 검색 결과 없음, 파트 탭이면 해당 파트 없음, 아니면 지원자 없음 안내
// TODO: 파트 탭 빈 화면 문구 디자인 확인
function ApplicantManagementEmptyState({
  keyword,
  isPositionSelected,
}: ApplicantManagementEmptyStateProps) {
  if (keyword !== '') {
    return <RecruitmentBoardSearchEmptyState keyword={keyword} clearLabel="검색어 삭제" />
  }

  if (isPositionSelected) {
    return (
      <RecruitmentBoardEmptyState
        icon={<UsersIcon className="size-7" />}
        title="해당 파트에 지원자가 없어요"
      />
    )
  }

  return (
    <RecruitmentBoardEmptyState
      icon={<UsersIcon className="size-7" />}
      title="아직 지원자가 없어요"
      description="지원서가 제출되면 여기에 바로 보여요"
    />
  )
}

// TODO: 조회 실패 디자인 확정 후 교체, 지금은 빈 화면과 같은 모양
function ApplicantManagementLoadError() {
  return (
    <div role="alert">
      <EmptyState
        icon={<UsersIcon className="size-7" />}
        title="조회에 실패했어요"
        className="rounded-none border-0"
      />
    </div>
  )
}

export { ApplicantManagementEmptyState, ApplicantManagementLoadError }

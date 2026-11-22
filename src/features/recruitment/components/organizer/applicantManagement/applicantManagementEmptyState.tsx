import UsersIcon from '@/assets/icons/users.svg'
import { RecruitmentBoardEmptyState } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardEmptyState'
import { RecruitmentBoardSearchEmptyState } from '@/features/recruitment/components/organizer/recruitmentBoard/recruitmentBoardSearchEmptyState'

type ApplicantManagementEmptyStateProps = {
  keyword: string
}

// 검색어가 있으면 검색 결과 없음, 없으면 지원자 없음 안내
// TODO: 다른 파트에는 지원자가 있고 선택한 파트만 0명일 때의 문구 디자인 확인
function ApplicantManagementEmptyState({ keyword }: ApplicantManagementEmptyStateProps) {
  if (keyword !== '') {
    return <RecruitmentBoardSearchEmptyState keyword={keyword} clearLabel="검색어 삭제" />
  }

  return (
    <RecruitmentBoardEmptyState
      icon={<UsersIcon className="size-7" />}
      title="아직 지원자가 없어요"
      description="지원서가 제출되면 여기에 바로 보여요"
    />
  )
}

export { ApplicantManagementEmptyState }

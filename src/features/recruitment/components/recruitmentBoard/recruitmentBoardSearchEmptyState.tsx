import SearchIcon from '@/assets/icons/search.svg'
import { RecruitmentBoardSearchClearButton } from './recruitmentBoard'
import { RecruitmentBoardEmptyState } from './recruitmentBoardEmptyState'

type RecruitmentBoardSearchEmptyStateProps = {
  keyword: string
  // TODO: 화면별 버튼 문구(검색어 삭제·지우기) 통일 여부 디자인 확인 후 제거
  clearLabel: string
}

// 검색어 지우기 버튼이 RecruitmentBoard의 검색 상태를 쓰므로 board 안에서만 사용
function RecruitmentBoardSearchEmptyState({
  keyword,
  clearLabel,
}: RecruitmentBoardSearchEmptyStateProps) {
  return (
    <RecruitmentBoardEmptyState
      icon={<SearchIcon className="size-7" />}
      title={`'${keyword}'에 해당하는 지원자가 없어요`}
      description="이름을 다시 확인하거나 다른 검색어로 찾아보세요."
      actions={<RecruitmentBoardSearchClearButton>{clearLabel}</RecruitmentBoardSearchClearButton>}
    />
  )
}

export { RecruitmentBoardSearchEmptyState }

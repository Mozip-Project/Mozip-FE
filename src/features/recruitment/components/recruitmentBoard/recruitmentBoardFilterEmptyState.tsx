import { RecruitmentBoardFilterResetButton } from './recruitmentBoard'
import { RecruitmentBoardEmptyState } from './recruitmentBoardEmptyState'
import type { ReactNode } from 'react'

type RecruitmentBoardFilterEmptyStateProps = {
  // TODO: 화면별 아이콘(필터·검색)과 설명 문구 통일 여부 디자인 확인 후 정리
  icon: ReactNode
  description: string
}

// 필터 초기화 버튼이 RecruitmentBoard의 조건 상태를 쓰므로 board 안에서만 사용
function RecruitmentBoardFilterEmptyState({
  icon,
  description,
}: RecruitmentBoardFilterEmptyStateProps) {
  return (
    <RecruitmentBoardEmptyState
      icon={icon}
      title="조건에 맞는 지원자가 없어요"
      description={description}
      actions={<RecruitmentBoardFilterResetButton />}
    />
  )
}

export { RecruitmentBoardFilterEmptyState }

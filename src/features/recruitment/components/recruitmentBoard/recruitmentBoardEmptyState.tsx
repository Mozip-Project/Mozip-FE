import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import type { ComponentProps } from 'react'

type RecruitmentBoardEmptyStateProps = Omit<ComponentProps<typeof EmptyState>, 'className'>

// 표 테두리 안에 표시, 조건 변경 결과를 화면 이동 없이 알림
function RecruitmentBoardEmptyState(props: RecruitmentBoardEmptyStateProps) {
  return (
    <div role="status">
      <EmptyState className="rounded-none border-0" {...props} />
    </div>
  )
}

export { RecruitmentBoardEmptyState }

import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'

// 서류 평가·취합 목록 공통, 이전 목록이 없는 조회 실패만 표시
// TODO: 조회 실패 디자인 확정 후 교체, 지금은 빈 화면과 같은 모양
function RecruitmentBoardLoadError() {
  return (
    <div role="alert">
      <EmptyState
        icon={<FileTextIcon className="size-7" />}
        title="조회에 실패했어요"
        className="rounded-none border-0"
      />
    </div>
  )
}

export { RecruitmentBoardLoadError }

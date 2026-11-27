import { Button } from '@/components/ui/Button/button'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'

function TimetableSummaryBar({ canConfirm }: { canConfirm: boolean }) {
  return (
    <SummaryBar
      status={canConfirm ? 'ready' : 'blocked'}
      className="page-bottom-bar"
      actions={
        // TODO: 확정 확인 모달·비활성 클릭 안내는 확정 단계 작업에서 연결
        <Button size="m" disabled={!canConfirm}>
          확정하기
        </Button>
      }
    >
      {canConfirm
        ? '모두 준비됐어요. 확정하면 지원자에게 일정을 안내할 수 있어요.'
        : '미배정 지원자를 모두 배정하면 확정할 수 있어요.'}
    </SummaryBar>
  )
}

export { TimetableSummaryBar }

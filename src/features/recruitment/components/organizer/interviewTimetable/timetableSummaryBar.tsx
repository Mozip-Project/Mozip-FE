import { useState } from 'react'
import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast/toast'
import { ConfirmTimetableDialog } from './confirmTimetableDialog'

// 하단 바 위 12px에 막힌 이유 표시, 버튼이 바 안에서 17px 아래라 둘을 더한 값
const BLOCKED_REASON_OFFSET_PX = 29

type ConfirmBlocker = {
  message: string
  reasonTitle: string
  reasonDescription: string
}

// 확정을 막는 항목, 미배정부터 안내
function getConfirmBlocker(
  unassignedCount: number,
  missingInterviewerCount: number,
): ConfirmBlocker | null {
  if (unassignedCount > 0) {
    return {
      message: '미배정 지원자를 모두 배정하면 확정할 수 있어요.',
      reasonTitle: `미배정 지원자가 ${unassignedCount}명 있어요.`,
      reasonDescription: '모두 배정해야 확정할 수 있어요.',
    }
  }
  if (missingInterviewerCount > 0) {
    return {
      message: '면접관이 없는 면접이 있어요. 모든 면접에 면접관을 추가해 주세요.',
      reasonTitle: `면접관이 없는 면접이 ${missingInterviewerCount}개 있어요.`,
      reasonDescription: '모든 면접에 면접관을 추가해야 확정할 수 있어요.',
    }
  }
  return null
}

type TimetableSummaryBarProps = {
  isConfirmed: boolean
  unassignedCount: number
  missingInterviewerCount: number
  // 확정 확인 모달의 면접 기간·인원 요약
  summary: string
  onConfirm: () => void
}

function TimetableSummaryBar({
  isConfirmed,
  unassignedCount,
  missingInterviewerCount,
  summary,
  onConfirm,
}: TimetableSummaryBarProps) {
  const [isConfirmedToastOpen, setIsConfirmedToastOpen] = useState(false)
  const blocker = getConfirmBlocker(unassignedCount, missingInterviewerCount)

  function handleConfirm() {
    onConfirm()
    setIsConfirmedToastOpen(true)
  }

  return (
    <ToastProvider>
      {/* 토스트를 하단 바 기준으로 두기 위해 고정 위치를 감싸는 쪽에 둠 */}
      <div className="page-bottom-bar">
        {isConfirmed ? (
          <SummaryBar
            status="blocked"
            actions={
              // TODO: 장소를 모두 입력하면 활성, 확정 후 장소 입력 단계에서 안내 화면으로 연결
              <Button size="m" disabled>
                서류 결과 및 면접 정보 안내하기
              </Button>
            }
          >
            장소를 입력하지 않은 면접이 있어요. 모든 면접에 장소를 입력해 주세요.
          </SummaryBar>
        ) : (
          <SummaryBar
            status={blocker ? 'blocked' : 'ready'}
            actions={
              blocker ? (
                <InfoPopover
                  side="top"
                  align="end"
                  sideOffset={BLOCKED_REASON_OFFSET_PX}
                  className="w-80"
                  title={blocker.reasonTitle}
                  description={blocker.reasonDescription}
                  trigger={
                    // 막힌 이유를 볼 수 있게 disabled 대신 aria-disabled 사용
                    <Button
                      size="m"
                      aria-disabled
                      className="cursor-not-allowed bg-disabled text-disabled hover:bg-disabled"
                    >
                      확정하기
                    </Button>
                  }
                />
              ) : (
                <ConfirmTimetableDialog
                  summary={summary}
                  onConfirm={handleConfirm}
                  trigger={<Button size="m">확정하기</Button>}
                />
              )
            }
          >
            {blocker?.message ?? '모두 준비됐어요. 확정하면 지원자에게 일정을 안내할 수 있어요.'}
          </SummaryBar>
        )}
        <Toast
          title="타임테이블을 확정했어요"
          open={isConfirmedToastOpen}
          onOpenChange={setIsConfirmedToastOpen}
        />
        {/* Figma 하단 바 위 20px */}
        <ToastViewport className="absolute bottom-full mb-5 px-0" />
      </div>
    </ToastProvider>
  )
}

export { TimetableSummaryBar }

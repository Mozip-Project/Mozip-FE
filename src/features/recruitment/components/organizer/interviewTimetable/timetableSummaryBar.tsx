import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import { SummaryBar } from '@/components/ui/SummaryBar/summaryBar'
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast/toast'
import type { TimetableMode } from '@/features/recruitment/hooks/useInterviewTimetable'
import { getInterviewResultNoticePath } from '@/features/recruitment/utils/recruitmentRoutes'
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

// 막힌 이유를 볼 수 있게 disabled 대신 aria-disabled로 누를 수 있는 비활성 버튼
function BlockedActionButton({
  label,
  reasonTitle,
  reasonDescription,
}: {
  label: ReactNode
  reasonTitle: string
  reasonDescription: string
}) {
  return (
    <InfoPopover
      side="top"
      align="end"
      sideOffset={BLOCKED_REASON_OFFSET_PX}
      className="w-80"
      title={reasonTitle}
      description={reasonDescription}
      trigger={
        <Button
          size="m"
          aria-disabled
          className="cursor-not-allowed bg-disabled text-disabled hover:bg-disabled"
        >
          {label}
        </Button>
      }
    />
  )
}

// 처음 확정과 수정 후 다시 확정의 버튼·모달·토스트 문구
const CONFIRM_COPY = {
  assign: {
    action: '확정하기',
    readyMessage: '모두 준비됐어요. 확정하면 지원자에게 일정을 안내할 수 있어요.',
    dialogTitle: '타임테이블을 확정할까요?',
    dialogDescription: '확정한 뒤에도 수정할 수 있어요.',
    toast: '타임테이블을 확정했어요',
  },
  edit: {
    action: '다시 확정하기',
    readyMessage: '모두 준비됐어요. 다시 확정하면 지원자에게 일정을 안내할 수 있어요.',
    dialogTitle: '수정한 내용으로 다시 확정할까요?',
    dialogDescription: '확정한 뒤에도 다시 수정할 수 있어요.',
    toast: '수정한 내용으로 다시 확정했어요',
  },
} satisfies Record<Exclude<TimetableMode, 'view'>, object>

type TimetableSummaryBarProps = {
  postingId: string
  mode: TimetableMode
  unassignedCount: number
  missingInterviewerCount: number
  missingLocationCount: number
  // 확정 확인 모달의 면접 기간·인원 요약
  summary: string
  onConfirm: () => void
}

function TimetableSummaryBar({
  postingId,
  mode,
  unassignedCount,
  missingInterviewerCount,
  missingLocationCount,
  summary,
  onConfirm,
}: TimetableSummaryBarProps) {
  // 닫히는 동안에도 문구가 남도록 마지막 문구와 열림 상태를 따로 둠
  const [toast, setToast] = useState({ title: '', isOpen: false })
  const blocker = getConfirmBlocker(unassignedCount, missingInterviewerCount)
  const copy = mode === 'view' ? null : CONFIRM_COPY[mode]

  function handleConfirm(title: string) {
    onConfirm()
    setToast({ title, isOpen: true })
  }

  return (
    <ToastProvider>
      {/* 토스트를 하단 바 기준으로 두기 위해 고정 위치를 감싸는 쪽에 둠 */}
      <div className="page-bottom-bar">
        {mode === 'view' && missingLocationCount > 0 && (
          <SummaryBar
            status="blocked"
            actions={
              <BlockedActionButton
                label="서류 결과 및 면접 정보 안내하기"
                reasonTitle="장소를 입력하지 않은 면접이 있어요."
                reasonDescription="모든 면접에 장소를 입력해야 안내할 수 있어요."
              />
            }
          >
            장소를 입력하지 않은 면접이 있어요. 모든 면접에 장소를 입력해 주세요.
          </SummaryBar>
        )}
        {mode === 'view' && missingLocationCount === 0 && (
          <SummaryBar
            status="next"
            actions={
              // TODO: 안내 화면에 면접 일시·장소 자동 입력은 안내 화면 연동 때 처리
              <Button asChild size="m">
                <Link href={getInterviewResultNoticePath(postingId)}>
                  서류 결과 및 면접 정보 안내하기
                </Link>
              </Button>
            }
          >
            모든 면접에 장소를 입력했어요. 서류 결과와 면접 정보를 안내해 주세요.
          </SummaryBar>
        )}
        {copy && (
          <SummaryBar
            status={blocker ? 'blocked' : 'ready'}
            actions={
              blocker ? (
                <BlockedActionButton
                  label={copy.action}
                  reasonTitle={blocker.reasonTitle}
                  reasonDescription={blocker.reasonDescription}
                />
              ) : (
                <ConfirmTimetableDialog
                  title={copy.dialogTitle}
                  description={copy.dialogDescription}
                  summary={summary}
                  onConfirm={() => handleConfirm(copy.toast)}
                  trigger={<Button size="m">{copy.action}</Button>}
                />
              )
            }
          >
            {blocker?.message ?? copy.readyMessage}
          </SummaryBar>
        )}
        <Toast
          title={toast.title}
          open={toast.isOpen}
          onOpenChange={(isOpen) => setToast((current) => ({ ...current, isOpen }))}
        />
        {/* Figma 하단 바 위 20px */}
        <ToastViewport className="absolute bottom-full mb-5 px-0" />
      </div>
    </ToastProvider>
  )
}

export { TimetableSummaryBar }

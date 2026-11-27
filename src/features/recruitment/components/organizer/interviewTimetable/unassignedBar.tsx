import InfoIcon from '@/assets/icons/info.svg'
import { Button } from '@/components/ui/Button/button'
import { InfoPopover } from '@/components/ui/InfoPopover/infoPopover'
import type { ActiveMove } from '@/features/recruitment/hooks/useInterviewTimetable'
import { useTimetableDropTarget } from '@/features/recruitment/hooks/useTimetableDrag'
import type { TimetableApplicant } from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { FOCUS_RING_CLASS } from './timetableStyles'
import { UnassignedChip } from './unassignedChip'
import type { TimetableMoveActions } from './timetableMoveActions'

type UnassignedBarProps = {
  applicants: TimetableApplicant[]
  activeMove: ActiveMove | null
  moveActions: TimetableMoveActions
}

// 배정된 카드를 옮기는 동안은 0명이어도 되돌릴 자리로 표시
function UnassignedBar({ applicants, activeMove, moveActions }: UnassignedBarProps) {
  const isMovingAssigned = activeMove !== null && activeMove.item.fromInterviewId !== null
  const { isOver, dropTargetProps } = useTimetableDropTarget(
    isMovingAssigned && activeMove.mode === 'drag',
    () => moveActions.onMoveTo({ type: 'unassigned' }),
  )

  if (applicants.length === 0 && !isMovingAssigned) {
    return null
  }

  return (
    <div
      {...dropTargetProps}
      className={cn(
        'flex flex-wrap items-center gap-x-gap-m gap-y-gap-s rounded-l bg-warning-weak px-padding-m py-padding-s',
        isOver && 'ring-2 ring-(--border-color-brand-solid) ring-inset',
      )}
    >
      <div className="flex shrink-0 items-center gap-gap-xs text-label1 font-semibold text-warning">
        <span>미배정</span> <span>{applicants.length}명</span>
        <InfoPopover
          sideOffset={8}
          title="지원자와 일정을 맞춘 뒤 표에 직접 배정해 주세요"
          description="다른 지원자가 있는 시간에 배정하면 그룹 면접으로 진행되고, [+ 면접 추가]로 자리를 늘릴 수도 있어요."
          trigger={
            <button
              type="button"
              aria-label="미배정 안내"
              className={cn(
                'flex size-4 cursor-pointer items-center justify-center rounded-full',
                FOCUS_RING_CLASS,
              )}
            >
              <InfoIcon aria-hidden className="size-4" />
            </button>
          }
        />
      </div>
      {applicants.length > 0 && (
        <>
          <span aria-hidden className="h-4 shrink-0 border-l border-neutral-muted" />
          <ul aria-label="미배정 지원자" className="flex min-w-0 flex-wrap items-center gap-gap-s">
            {applicants.map((applicant) => (
              <li key={applicant.id} className="min-w-0">
                <UnassignedChip applicant={applicant} moveActions={moveActions} />
              </li>
            ))}
          </ul>
        </>
      )}
      {isMovingAssigned && activeMove.mode === 'select' && (
        <Button
          variant="tertiary"
          size="s"
          className="ml-auto"
          onClick={() => moveActions.onMoveTo({ type: 'unassigned' })}
        >
          미배정으로 되돌리기
        </Button>
      )}
    </div>
  )
}

export { UnassignedBar }

import PlusIcon from '@/assets/icons/plus.svg'
import type { ActiveMove, TimetableMode } from '@/features/recruitment/hooks/useInterviewTimetable'
import { useTimetableDropTarget } from '@/features/recruitment/hooks/useTimetableDrag'
import type {
  TimetableApplicant,
  TimetableInterview,
  TimetableInterviewer,
  TimetableSlot,
} from '@/features/recruitment/types'
import { cn } from '@/lib/utils'
import { TimetableSlotCard } from './timetableSlotCard'
import { FOCUS_RING_CLASS, SELECTED_BORDER_CLASS } from './timetableStyles'
import type { InterviewerOption } from './interviewerPopoverContent'
import type { TimetableMoveActions } from './timetableMoveActions'

type TimetableSlotCellProps = {
  slot: TimetableSlot
  slotLabel: string
  interview: TimetableInterview | undefined
  applicants: TimetableApplicant[]
  interviewers: TimetableInterviewer[]
  interviewerOptions: InterviewerOption[]
  isAvailable: boolean
  mode: TimetableMode
  recentLocations: string[]
  activeMove: ActiveMove | null
  moveActions: TimetableMoveActions
  onInterviewersChange: (interviewerIds: string[]) => void
  onLocationChange: (location: string) => void
}

// 빈 칸에 놓으면 배정, 배정된 칸에 놓으면 그룹 면접
function TimetableSlotCell({
  slot,
  slotLabel,
  interview,
  applicants,
  interviewers,
  interviewerOptions,
  isAvailable,
  mode,
  recentLocations,
  activeMove,
  moveActions,
  onInterviewersChange,
  onLocationChange,
}: TimetableSlotCellProps) {
  const isOwnInterview =
    interview !== undefined && activeMove?.item.fromInterviewId === interview.id
  const { isOver, dropTargetProps } = useTimetableDropTarget(
    activeMove?.mode === 'drag' && !isOwnInterview,
    () => moveActions.onMoveTo({ type: 'slot', slot }),
  )

  const canJoinBySelect = activeMove?.mode === 'select' && interview && !isOwnInterview

  return (
    <div {...dropTargetProps} className="relative flex min-w-56 flex-1">
      {interview ? (
        <>
          <TimetableSlotCard
            interview={interview}
            applicants={applicants}
            interviewers={interviewers}
            interviewerOptions={interviewerOptions}
            mode={mode}
            isDropTarget={isOver}
            recentLocations={recentLocations}
            moveActions={moveActions}
            onInterviewersChange={onInterviewersChange}
            onLocationChange={onLocationChange}
          />
          {/* 키보드·터치로도 그룹 면접을 만들 수 있게 선택 중에만 카드를 덮는 배정 버튼 */}
          {canJoinBySelect && (
            <button
              type="button"
              aria-label={`${slotLabel}에 함께 배정`}
              onClick={() => moveActions.onMoveTo({ type: 'slot', slot })}
              className={cn(
                'absolute inset-0 z-2 cursor-pointer rounded-m hover:ring-2 hover:ring-(--border-color-brand-solid) hover:ring-inset',
                FOCUS_RING_CLASS,
              )}
            />
          )}
        </>
      ) : (
        <TimetableEmptySlot
          slotLabel={slotLabel}
          isHighlighted={isAvailable || isOver}
          isSelecting={activeMove?.mode === 'select'}
          onSelect={() => moveActions.onMoveTo({ type: 'slot', slot })}
        />
      )}
    </div>
  )
}

type TimetableEmptySlotProps = {
  slotLabel: string
  isHighlighted: boolean
  isSelecting: boolean
  onSelect: () => void
}

function TimetableEmptySlot({
  slotLabel,
  isHighlighted,
  isSelecting,
  onSelect,
}: TimetableEmptySlotProps) {
  const className = cn(
    // 카드와 같이 테두리 1px만큼 padding을 줄여 Figma 안쪽 테두리 위치에 맞춤
    'flex min-h-19.5 flex-1 items-center gap-gap-xs rounded-m border px-2.75 py-padding-xs',
    isHighlighted
      ? cn(SELECTED_BORDER_CLASS, 'bg-brand-weak')
      : 'border-dashed border-neutral-subtle',
  )
  const hint = isHighlighted && (
    <>
      <PlusIcon aria-hidden className="size-4 shrink-0 text-brand" />
      <span className="text-caption1 font-medium text-brand">여기에 배정</span>
    </>
  )

  if (!isSelecting) {
    return <div className={className}>{hint}</div>
  }

  return (
    <button
      type="button"
      aria-label={`${slotLabel}에 배정`}
      onClick={onSelect}
      className={cn(
        className,
        'cursor-pointer',
        !isHighlighted && 'hover:border-solid hover:border-brand-solid',
        FOCUS_RING_CLASS,
      )}
    >
      {hint}
    </button>
  )
}

export { TimetableSlotCell }

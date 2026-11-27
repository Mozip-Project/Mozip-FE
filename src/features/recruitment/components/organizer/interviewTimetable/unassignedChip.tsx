import { useRef } from 'react'
import GripVerticalIcon from '@/assets/icons/gripVertical.svg'
import { setTimetableDragData } from '@/features/recruitment/hooks/useTimetableDrag'
import type { TimetableApplicant, TimetableMoveItem } from '@/features/recruitment/types'
import { formatAvailability } from '@/features/recruitment/utils/interviewTimetable'
import { cn } from '@/lib/utils'
import { TimetableApplicantName } from './timetableApplicantName'
import { TimetableDragGhost } from './timetableDragGhost'
import { FOCUS_RING_CLASS } from './timetableStyles'
import type { TimetableMoveActions } from './timetableMoveActions'

type UnassignedChipProps = {
  applicant: TimetableApplicant
  moveActions: TimetableMoveActions
}

// 누르면 가능한 빈 칸 강조, 끌어서 놓아도 배정
function UnassignedChip({ applicant, moveActions }: UnassignedChipProps) {
  const ghostRef = useRef<HTMLSpanElement>(null)
  const item: TimetableMoveItem = { applicantIds: [applicant.id], fromInterviewId: null }
  const isSelected = moveActions.isMoving(item)
  const availability = formatAvailability(applicant.availableTimes)

  return (
    <>
      <button
        type="button"
        draggable
        data-track-target="timetable_unassigned_select"
        aria-pressed={isSelected}
        onClick={() => moveActions.onToggleSelect(item)}
        onDragStart={(event) => {
          setTimetableDragData(event, applicant.name, ghostRef.current)
          moveActions.onStartDrag(item)
        }}
        onDragEnd={moveActions.onEndDrag}
        className={cn(
          // Figma 선택 칩은 테두리 2px만큼 커짐(219×38 → 221×40)
          'flex max-w-full cursor-grab items-center gap-gap-s rounded-m px-padding-s py-padding-xs active:cursor-grabbing',
          FOCUS_RING_CLASS,
          isSelected
            ? 'border-2 border-brand-solid bg-brand-weak'
            : 'border border-neutral-muted bg-layer-default hover:bg-layer-default-pressed',
        )}
      >
        <GripVerticalIcon aria-hidden className="size-4 shrink-0 text-neutral-subtle" />
        <TimetableApplicantName applicant={applicant} />
        {availability && (
          <>
            <span aria-hidden className="h-3 shrink-0 border-l border-neutral-muted" />
            <span className="truncate text-caption1 font-medium text-brand">{availability}</span>
          </>
        )}
      </button>
      <TimetableDragGhost ref={ghostRef} applicant={applicant} />
    </>
  )
}

export { UnassignedChip }

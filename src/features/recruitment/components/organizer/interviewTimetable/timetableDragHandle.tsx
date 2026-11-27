import { useRef } from 'react'
import GripVerticalIcon from '@/assets/icons/gripVertical.svg'
import { setTimetableDragData } from '@/features/recruitment/hooks/useTimetableDrag'
import type { TimetableApplicant, TimetableMoveItem } from '@/features/recruitment/types'
import { TimetableDragGhost } from './timetableDragGhost'
import type { TimetableMoveActions } from './timetableMoveActions'

type TimetableDragHandleProps = {
  applicant: TimetableApplicant
  item: TimetableMoveItem
  moveActions: TimetableMoveActions
}

// 끌어서 옮기거나, 눌러서 고른 뒤 칸을 눌러 옮김
function TimetableDragHandle({ applicant, item, moveActions }: TimetableDragHandleProps) {
  const ghostRef = useRef<HTMLSpanElement>(null)

  return (
    <>
      <button
        type="button"
        draggable
        aria-label={`${applicant.name} 옮기기`}
        aria-pressed={moveActions.isMoving(item)}
        onClick={() => moveActions.onToggleSelect(item)}
        onDragStart={(event) => {
          setTimetableDragData(event, applicant.name, ghostRef.current)
          moveActions.onStartDrag(item)
        }}
        onDragEnd={moveActions.onEndDrag}
        className="relative z-1 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded-xs text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid active:cursor-grabbing aria-pressed:text-brand"
      >
        <GripVerticalIcon aria-hidden className="size-4" />
      </button>
      <TimetableDragGhost ref={ghostRef} applicant={applicant} />
    </>
  )
}

export { TimetableDragHandle }

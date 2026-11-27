import { useState, type DragEvent } from 'react'

// 커서가 고스트의 핸들 위에 오도록 맞춘 위치
const DRAG_GHOST_OFFSET_PX = 20

// Firefox는 데이터가 없으면 끌기를 시작하지 않아 이름을 함께 실음
function setTimetableDragData(
  event: DragEvent<HTMLElement>,
  label: string,
  ghost: HTMLElement | null,
) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', label)
  if (ghost) {
    event.dataTransfer.setDragImage(ghost, DRAG_GHOST_OFFSET_PX, DRAG_GHOST_OFFSET_PX)
  }
}

function useTimetableDropTarget(canDrop: boolean, onDrop: () => void) {
  const [isOver, setIsOver] = useState(false)

  return {
    isOver: canDrop && isOver,
    dropTargetProps: {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        if (!canDrop) {
          return
        }
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setIsOver(true)
      },
      onDragLeave: (event: DragEvent<HTMLElement>) => {
        // 안쪽 요소로 옮겨 가는 경우는 계속 위에 있는 것으로 처리
        const nextTarget = event.relatedTarget
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          return
        }
        setIsOver(false)
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        setIsOver(false)
        if (canDrop) {
          onDrop()
        }
      },
    },
  }
}

export { setTimetableDragData, useTimetableDropTarget }

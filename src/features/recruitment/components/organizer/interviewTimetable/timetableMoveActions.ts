import type { TimetableMoveItem, TimetableMoveTarget } from '@/features/recruitment/types'

type TimetableMoveActions = {
  isMoving: (item: TimetableMoveItem) => boolean
  onStartDrag: (item: TimetableMoveItem) => void
  onEndDrag: () => void
  onToggleSelect: (item: TimetableMoveItem) => void
  onMoveTo: (target: TimetableMoveTarget) => void
}

export type { TimetableMoveActions }

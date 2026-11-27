import { useEffect, useState } from 'react'
import type {
  InterviewTimetable,
  TimetableApplicant,
  TimetableMoveItem,
  TimetableMoveTarget,
} from '@/features/recruitment/types'
import {
  addTrack,
  getAvailableEmptySlotKeys,
  getDatesOfSlotKeys,
  getDatesWithUnassignedApplicants,
  keepAddedTracks,
  moveApplicants,
  setInterviewers,
} from '@/features/recruitment/utils/interviewTimetable'

// drag: 끄는 중, select: 칩·핸들을 눌러 고른 뒤 칸을 눌러 배정
type TimetableMoveMode = 'drag' | 'select'

type ActiveMove = {
  item: TimetableMoveItem
  mode: TimetableMoveMode
}

function isSameMoveItem(a: TimetableMoveItem, b: TimetableMoveItem) {
  return (
    a.fromInterviewId === b.fromInterviewId &&
    a.applicantIds.length === b.applicantIds.length &&
    a.applicantIds.every((id) => b.applicantIds.includes(id))
  )
}

type UseInterviewTimetableOptions = {
  initialTimetable: InterviewTimetable
  applicants: TimetableApplicant[]
}

// TODO: 타임테이블 조회·배정·다시 생성 API 확정 후 서버 상태로 교체
function useInterviewTimetable({ initialTimetable, applicants }: UseInterviewTimetableOptions) {
  const [timetable, setTimetable] = useState(initialTimetable)
  const [selectedDate, setSelectedDate] = useState(initialTimetable.days[0]?.date ?? '')
  const [activeMove, setActiveMove] = useState<ActiveMove | null>(null)
  const isSelecting = activeMove?.mode === 'select'

  const applicantsById = new Map(applicants.map((applicant) => [applicant.id, applicant]))
  const movingApplicants = (activeMove?.item.applicantIds ?? []).flatMap((id) => {
    const applicant = applicantsById.get(id)
    return applicant ? [applicant] : []
  })
  const availableSlotKeys = getAvailableEmptySlotKeys(timetable, movingApplicants)

  useEffect(() => {
    if (!isSelecting) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveMove(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSelecting])

  function startDrag(item: TimetableMoveItem) {
    setActiveMove({ item, mode: 'drag' })
  }

  function toggleSelect(item: TimetableMoveItem) {
    setActiveMove((current) =>
      current?.mode === 'select' && isSameMoveItem(current.item, item)
        ? null
        : { item, mode: 'select' },
    )
  }

  function cancelMove() {
    setActiveMove(null)
  }

  function moveTo(target: TimetableMoveTarget) {
    if (!activeMove) {
      return
    }

    const { item } = activeMove
    setTimetable((current) => moveApplicants(current, item, target, crypto.randomUUID()))
    setActiveMove(null)
  }

  function isMoving(item: TimetableMoveItem) {
    return activeMove !== null && isSameMoveItem(activeMove.item, item)
  }

  return {
    timetable,
    applicantsById,
    selectedDate,
    selectDate: setSelectedDate,
    activeMove,
    availableSlotKeys,
    datesWithAvailableSlot: getDatesOfSlotKeys(timetable, availableSlotKeys),
    datesWithUnassignedApplicants: getDatesWithUnassignedApplicants(timetable, applicantsById),
    startDrag,
    toggleSelect,
    cancelMove,
    moveTo,
    isMoving,
    addTrack: (date: string) => setTimetable((current) => addTrack(current, date)),
    changeInterviewers: (interviewId: string, interviewerIds: string[]) =>
      setTimetable((current) => setInterviewers(current, interviewId, interviewerIds)),
    // TODO: 다시 생성 API 연결, 지금은 처음 생성한 배정으로 되돌림
    regenerate: () => setTimetable((current) => keepAddedTracks(initialTimetable, current)),
  }
}

export { useInterviewTimetable }
export type { ActiveMove, TimetableMoveMode }

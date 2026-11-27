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
  getInterviewsWithoutInterviewers,
  getInterviewsWithoutLocation,
  getUsedLocations,
  keepAddedTracks,
  moveApplicants,
  setInterviewLocation,
  setInterviewers,
  setTrackLocation,
} from '@/features/recruitment/utils/interviewTimetable'

// drag: 끄는 중, select: 칩·핸들을 눌러 고른 뒤 칸을 눌러 배정
type TimetableMoveMode = 'drag' | 'select'

// assign: 확정 전 배정, view: 확정 후 보기·장소 입력, edit: 확정 후 수정
type TimetableMode = 'assign' | 'view' | 'edit'

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

function getTimetableMode(isConfirmed: boolean, isEditing: boolean): TimetableMode {
  if (!isConfirmed) {
    return 'assign'
  }
  return isEditing ? 'edit' : 'view'
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
  const [isConfirmed, setIsConfirmed] = useState(false)
  // 수정 시작 시점의 타임테이블, 수정 취소 시 되돌림
  const [editSnapshot, setEditSnapshot] = useState<InterviewTimetable | null>(null)
  const isSelecting = activeMove?.mode === 'select'

  const applicantsById = new Map(applicants.map((applicant) => [applicant.id, applicant]))
  const movingApplicants = (activeMove?.item.applicantIds ?? []).flatMap((id) => {
    const applicant = applicantsById.get(id)
    return applicant ? [applicant] : []
  })
  const availableSlotKeys = getAvailableEmptySlotKeys(timetable, movingApplicants)
  const interviewsWithoutInterviewers = getInterviewsWithoutInterviewers(timetable)
  // 그날 확정을 막는 항목: 미배정 지원자가 가능한 날짜, 면접관 없는 면접이 있는 날짜
  const blockedDates = new Set([
    ...getDatesWithUnassignedApplicants(timetable, applicantsById),
    ...interviewsWithoutInterviewers.map(({ date }) => date),
  ])

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
    blockedDates,
    missingInterviewerCount: interviewsWithoutInterviewers.length,
    startDrag,
    toggleSelect,
    cancelMove,
    moveTo,
    isMoving,
    addTrack: (date: string) => setTimetable((current) => addTrack(current, date)),
    changeInterviewers: (interviewId: string, interviewerIds: string[]) =>
      setTimetable((current) => setInterviewers(current, interviewId, interviewerIds)),
    // TODO: 다시 생성 API 연결, 지금은 처음 생성한 배정으로 되돌림
    regenerate: () => {
      // 옛 배정 기준으로 고른 이동이 새 배정에 적용되지 않도록 취소
      setActiveMove(null)
      setTimetable((current) => keepAddedTracks(initialTimetable, current))
    },
    missingLocationCount: getInterviewsWithoutLocation(timetable).length,
    usedLocations: getUsedLocations(timetable),
    // TODO: 면접 장소 저장 API 연결
    changeInterviewLocation: (interviewId: string, location: string) =>
      setTimetable((current) => setInterviewLocation(current, interviewId, location)),
    changeTrackLocation: (date: string, track: number, location: string) =>
      setTimetable((current) => setTrackLocation(current, date, track, location)),
    mode: getTimetableMode(isConfirmed, editSnapshot !== null),
    // TODO: 타임테이블 확정·다시 확정 API 연결
    confirm: () => {
      setActiveMove(null)
      setIsConfirmed(true)
      setEditSnapshot(null)
    },
    startEdit: () => setEditSnapshot(timetable),
    cancelEdit: () => {
      if (editSnapshot) {
        setTimetable(editSnapshot)
      }
      setActiveMove(null)
      setEditSnapshot(null)
    },
  }
}

export { useInterviewTimetable }
export type { ActiveMove, TimetableMode, TimetableMoveMode }

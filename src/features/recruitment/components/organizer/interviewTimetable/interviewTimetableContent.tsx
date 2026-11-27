'use client'

import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { Tabs, TabsContent } from '@/components/ui/Tabs/tabs'
import { useInterviewTimetable } from '@/features/recruitment/hooks/useInterviewTimetable'
import {
  SAMPLE_INTERVIEW_RULE,
  SAMPLE_INTERVIEW_TIMETABLE,
  SAMPLE_TIMETABLE_APPLICANTS,
  SAMPLE_TIMETABLE_INTERVIEWERS,
} from '@/features/recruitment/mocks/interviewTimetableSample'
import {
  formatTimetableSummary,
  getAssignedCount,
} from '@/features/recruitment/utils/interviewTimetable'
import { RegenerateTimetableDialog } from './regenerateTimetableDialog'
import { TimetableDateTabList, type TimetableDateStatus } from './timetableDateTabList'
import { TimetableGrid } from './timetableGrid'
import { TimetableSummaryBar } from './timetableSummaryBar'
import { UnassignedBar } from './unassignedBar'
import type { TimetableMoveActions } from './timetableMoveActions'

// TODO: 타임테이블 API 확정 후 샘플 대신 조회 결과 사용, 조회 중 스켈레톤(Figma 4312:150103) 추가
function InterviewTimetableContent() {
  const { postingId } = useParams<{ postingId: string }>()
  const {
    timetable,
    applicantsById,
    selectedDate,
    selectDate,
    activeMove,
    availableSlotKeys,
    datesWithAvailableSlot,
    blockedDates,
    missingInterviewerCount,
    startDrag,
    toggleSelect,
    cancelMove,
    moveTo,
    isMoving,
    addTrack,
    changeInterviewers,
    regenerate,
    missingLocationCount,
    usedLocations,
    changeInterviewLocation,
    changeTrackLocation,
    mode,
    confirm,
    startEdit,
    cancelEdit,
  } = useInterviewTimetable({
    initialTimetable: SAMPLE_INTERVIEW_TIMETABLE,
    applicants: SAMPLE_TIMETABLE_APPLICANTS,
  })

  const moveActions: TimetableMoveActions = {
    isMoving,
    onStartDrag: startDrag,
    onEndDrag: cancelMove,
    onToggleSelect: toggleSelect,
    onMoveTo: moveTo,
  }
  const unassignedApplicants = timetable.unassignedApplicantIds.flatMap((id) => {
    const applicant = applicantsById.get(id)
    return applicant ? [applicant] : []
  })

  // 옮기는 중에는 다른 날짜 중 놓을 수 있는 날짜를 표시, 보고 있는 날짜는 원래 상태 유지
  function getDateStatus(date: string): TimetableDateStatus | null {
    if (mode === 'view') {
      return null
    }
    if (activeMove && date !== selectedDate && datesWithAvailableSlot.has(date)) {
      return 'available'
    }
    return blockedDates.has(date) ? 'blocked' : null
  }

  // 확정 전 다시 생성, 확정 후 수정, 수정 중 수정 취소(확정 상태로 되돌림)
  function getHeaderAction() {
    switch (mode) {
      case 'assign':
        return <RegenerateTimetableDialog onRegenerate={regenerate} />
      case 'view':
        return (
          <Button variant="secondary" size="m" onClick={startEdit}>
            수정하기
          </Button>
        )
      case 'edit':
        return (
          <Button variant="secondary" size="m" onClick={cancelEdit}>
            수정 취소
          </Button>
        )
    }
  }

  return (
    <>
      <PageHeader title="면접 타임테이블" actions={getHeaderAction()} />
      <Tabs value={selectedDate} onValueChange={selectDate} className="flex flex-col gap-gap-xl">
        <TimetableDateTabList
          tabs={timetable.days.map(({ date }) => ({
            date,
            assignedCount: getAssignedCount(timetable, date),
            status: getDateStatus(date),
          }))}
          selectedDate={selectedDate}
          isDragging={activeMove?.mode === 'drag'}
          interviewRuleLabel={`면접 ${SAMPLE_INTERVIEW_RULE.interviewMinutes}분 · 쉬는 시간 ${SAMPLE_INTERVIEW_RULE.breakMinutes}분`}
          onDateChange={selectDate}
        />
        {mode !== 'view' && (
          <UnassignedBar
            applicants={unassignedApplicants}
            activeMove={activeMove}
            moveActions={moveActions}
          />
        )}
        {/* 다른 날짜로 끌고 가도 출발 카드가 남아 있어야 dragend가 와서 모두 렌더링 */}
        {timetable.days.map((day) => (
          <TabsContent
            key={day.date}
            value={day.date}
            forceMount
            className="data-[state=inactive]:hidden"
          >
            <TimetableGrid
              day={day}
              timetable={timetable}
              applicantsById={applicantsById}
              interviewers={SAMPLE_TIMETABLE_INTERVIEWERS}
              availableSlotKeys={availableSlotKeys}
              mode={mode}
              recentLocations={usedLocations}
              activeMove={activeMove}
              moveActions={moveActions}
              onAddTrack={() => addTrack(day.date)}
              onInterviewersChange={changeInterviewers}
              onInterviewLocationChange={changeInterviewLocation}
              onTrackLocationChange={(track, location) =>
                changeTrackLocation(day.date, track, location)
              }
            />
          </TabsContent>
        ))}
      </Tabs>
      <TimetableSummaryBar
        postingId={postingId}
        mode={mode}
        unassignedCount={unassignedApplicants.length}
        missingInterviewerCount={missingInterviewerCount}
        missingLocationCount={missingLocationCount}
        summary={formatTimetableSummary(timetable)}
        onConfirm={confirm}
      />
    </>
  )
}

export { InterviewTimetableContent }

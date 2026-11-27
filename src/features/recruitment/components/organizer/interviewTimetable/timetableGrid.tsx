import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from '@/components/ui/Button/button'
import type { ActiveMove } from '@/features/recruitment/hooks/useInterviewTimetable'
import type {
  InterviewTimetable,
  TimetableApplicant,
  TimetableDay,
  TimetableInterview,
  TimetableInterviewer,
} from '@/features/recruitment/types'
import {
  findInterviewAt,
  getBusyInterviewers,
  getSlotKey,
  getTrackLabel,
  getTrackLocationLabel,
} from '@/features/recruitment/utils/interviewTimetable'
import { TimetableSlotCell } from './timetableSlotCell'
import { TimetableTrackHeader } from './timetableTrackHeader'
import type { InterviewerOption } from './interviewerPopoverContent'
import type { TimetableMoveActions } from './timetableMoveActions'

const TIME_COLUMN_CLASS = 'w-14 shrink-0'
const ADD_COLUMN_CLASS = 'flex w-23.75 shrink-0 justify-end'

type TimetableGridProps = {
  day: TimetableDay
  timetable: InterviewTimetable
  applicantsById: Map<string, TimetableApplicant>
  interviewers: TimetableInterviewer[]
  availableSlotKeys: Set<string>
  isReadOnly: boolean
  recentLocations: string[]
  activeMove: ActiveMove | null
  moveActions: TimetableMoveActions
  onAddTrack: () => void
  onInterviewersChange: (interviewId: string, interviewerIds: string[]) => void
  onInterviewLocationChange: (interviewId: string, location: string) => void
  onTrackLocationChange: (track: number, location: string) => void
}

function TimetableGrid({
  day,
  timetable,
  applicantsById,
  interviewers,
  availableSlotKeys,
  isReadOnly,
  recentLocations,
  activeMove,
  moveActions,
  onAddTrack,
  onInterviewersChange,
  onInterviewLocationChange,
  onTrackLocationChange,
}: TimetableGridProps) {
  const tracks = Array.from({ length: day.trackCount }, (_, index) => index + 1)

  function getInterviewerOptions(interview: TimetableInterview): InterviewerOption[] {
    const busyInterviewers = getBusyInterviewers(timetable, interview)

    return interviewers
      .filter(({ id }) => !interview.interviewerIds.includes(id))
      .map((interviewer) => {
        const busyInterview = busyInterviewers.get(interviewer.id)
        return {
          interviewer,
          busyReason: busyInterview
            ? `${busyInterview.time} ${getTrackLabel(busyInterview.track)} 면접에 있어요`
            : null,
        }
      })
  }

  return (
    <div className="overflow-x-auto rounded-l border border-neutral-muted bg-layer-default">
      <div className="w-max min-w-full">
        <div className="flex items-center gap-gap-s bg-neutral-weak px-padding-m py-padding-s">
          <span className={`${TIME_COLUMN_CLASS} text-caption1 font-medium text-neutral-subtle`}>
            시간
          </span>
          {tracks.map((track) => (
            <TimetableTrackHeader
              key={track}
              trackLabel={getTrackLabel(track)}
              isReadOnly={isReadOnly}
              locationLabel={getTrackLocationLabel(
                timetable.interviews.filter(
                  (interview) => interview.date === day.date && interview.track === track,
                ),
              )}
              recentLocations={recentLocations}
              onLocationApply={(location) => onTrackLocationChange(track, location)}
            />
          ))}
          {!isReadOnly && (
            <span className={ADD_COLUMN_CLASS}>
              <Button variant="tertiary" size="s" onClick={onAddTrack}>
                <PlusIcon aria-hidden />
                면접 추가
              </Button>
            </span>
          )}
        </div>
        {day.times.map((time) => (
          <div
            key={time}
            className="flex items-stretch gap-gap-s border-t border-neutral-subtle px-padding-m py-padding-xs"
          >
            <span
              className={`${TIME_COLUMN_CLASS} self-center text-label1 font-medium text-neutral-muted`}
            >
              {time}
            </span>
            {tracks.map((track) => {
              const slot = { date: day.date, time, track }
              const interview = findInterviewAt(timetable.interviews, slot)

              return (
                <TimetableSlotCell
                  key={track}
                  slot={slot}
                  slotLabel={`${time} ${getTrackLabel(track)}`}
                  interview={interview}
                  applicants={(interview?.applicantIds ?? []).flatMap((id) => {
                    const applicant = applicantsById.get(id)
                    return applicant ? [applicant] : []
                  })}
                  interviewers={interviewers.filter(({ id }) =>
                    interview?.interviewerIds.includes(id),
                  )}
                  interviewerOptions={interview ? getInterviewerOptions(interview) : []}
                  isAvailable={availableSlotKeys.has(getSlotKey(slot))}
                  isReadOnly={isReadOnly}
                  recentLocations={recentLocations}
                  activeMove={activeMove}
                  moveActions={moveActions}
                  onInterviewersChange={(interviewerIds) => {
                    if (interview) {
                      onInterviewersChange(interview.id, interviewerIds)
                    }
                  }}
                  onLocationChange={(location) => {
                    if (interview) {
                      onInterviewLocationChange(interview.id, location)
                    }
                  }}
                />
              )
            })}
            {!isReadOnly && <span aria-hidden className={ADD_COLUMN_CLASS} />}
          </div>
        ))}
      </div>
    </div>
  )
}

export { TimetableGrid }

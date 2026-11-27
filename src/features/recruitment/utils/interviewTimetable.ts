import type {
  InterviewTimetable,
  TimetableApplicant,
  TimetableInterview,
  TimetableMoveItem,
  TimetableMoveTarget,
  TimetableSlot,
  TimetableSlotTime,
} from '@/features/recruitment/types'
import { formatMonthDay, formatMonthDayWithWeekday } from '@/utils/date'

function isSameTime(a: TimetableSlotTime, b: TimetableSlotTime) {
  return a.date === b.date && a.time === b.time
}

function isSameSlot(a: TimetableSlot, b: TimetableSlot) {
  return isSameTime(a, b) && a.track === b.track
}

function getSlotKey({ date, time, track }: TimetableSlot) {
  return `${date} ${time} ${track}`
}

function getTrackLabel(track: number) {
  return `면접실 ${track}`
}

function findInterviewAt(interviews: TimetableInterview[], slot: TimetableSlot) {
  return interviews.find((interview) => isSameSlot(interview, slot))
}

function isAvailableAt(applicant: TimetableApplicant, time: TimetableSlotTime) {
  return applicant.availableTimes.some((availableTime) => isSameTime(availableTime, time))
}

// 가능한 시간이 하나면 날짜·시각, 여러 개면 날짜만 모아 표시
function formatAvailability(availableTimes: TimetableSlotTime[]) {
  const [onlyTime] = availableTimes

  if (availableTimes.length === 1 && onlyTime) {
    return `${formatMonthDayWithWeekday(onlyTime.date)} ${onlyTime.time} 가능`
  }

  const dates = [...new Set(availableTimes.map(({ date }) => date))].sort()

  return dates.length > 0 ? `${dates.map(formatMonthDay).join(', ')} 가능` : null
}

function getAssignedCount(timetable: InterviewTimetable, date: string) {
  return timetable.interviews
    .filter((interview) => interview.date === date)
    .reduce((count, interview) => count + interview.applicantIds.length, 0)
}

function getAvailableEmptySlotKeys(
  timetable: InterviewTimetable,
  applicants: TimetableApplicant[],
) {
  const slotKeys = new Set<string>()

  if (applicants.length === 0) {
    return slotKeys
  }

  for (const day of timetable.days) {
    for (const time of day.times) {
      const slotTime = { date: day.date, time }
      const isAvailableForAll = applicants.every((applicant) => isAvailableAt(applicant, slotTime))

      if (!isAvailableForAll) {
        continue
      }

      for (let track = 1; track <= day.trackCount; track += 1) {
        const slot = { ...slotTime, track }
        if (!findInterviewAt(timetable.interviews, slot)) {
          slotKeys.add(getSlotKey(slot))
        }
      }
    }
  }

  return slotKeys
}

function getDatesOfSlotKeys(timetable: InterviewTimetable, slotKeys: Set<string>) {
  return new Set(
    timetable.days
      .filter((day) => [...slotKeys].some((key) => key.startsWith(`${day.date} `)))
      .map((day) => day.date),
  )
}

// 미배정 지원자가 가능한 날짜, 그날 확정을 막는 항목으로 표시
function getDatesWithUnassignedApplicants(
  timetable: InterviewTimetable,
  applicantsById: Map<string, TimetableApplicant>,
) {
  const dates = new Set<string>()

  for (const applicantId of timetable.unassignedApplicantIds) {
    for (const { date } of applicantsById.get(applicantId)?.availableTimes ?? []) {
      dates.add(date)
    }
  }

  return dates
}

// 면접관이 한 명도 없는 면접, 확정을 막는 항목
function getInterviewsWithoutInterviewers(timetable: InterviewTimetable) {
  return timetable.interviews.filter((interview) => interview.interviewerIds.length === 0)
}

function getBusyInterviewers(timetable: InterviewTimetable, interview: TimetableInterview) {
  const busyInterviewers = new Map<string, TimetableInterview>()

  for (const other of timetable.interviews) {
    if (other.id === interview.id || !isSameTime(other, interview)) {
      continue
    }
    for (const interviewerId of other.interviewerIds) {
      busyInterviewers.set(interviewerId, other)
    }
  }

  return busyInterviewers
}

function removeApplicants(interviews: TimetableInterview[], applicantIds: string[]) {
  return interviews
    .map((interview) => ({
      ...interview,
      applicantIds: interview.applicantIds.filter((id) => !applicantIds.includes(id)),
    }))
    .filter((interview) => interview.applicantIds.length > 0)
}

// 빈 칸이면 새 면접, 배정된 칸이면 그룹 면접, 미배정 바면 미배정으로 되돌림
function moveApplicants(
  timetable: InterviewTimetable,
  item: TimetableMoveItem,
  target: TimetableMoveTarget,
  newInterviewId: string,
): InterviewTimetable {
  const source = timetable.interviews.find((interview) => interview.id === item.fromInterviewId)
  const targetInterview =
    target.type === 'slot' ? findInterviewAt(timetable.interviews, target.slot) : undefined
  const isUnchanged =
    target.type === 'unassigned' ? !source : source !== undefined && source === targetInterview

  if (isUnchanged) {
    return timetable
  }

  const interviews = removeApplicants(timetable.interviews, item.applicantIds)
  const unassignedApplicantIds = timetable.unassignedApplicantIds.filter(
    (id) => !item.applicantIds.includes(id),
  )

  if (target.type === 'unassigned') {
    return {
      ...timetable,
      interviews,
      unassignedApplicantIds: [...unassignedApplicantIds, ...item.applicantIds],
    }
  }

  if (targetInterview) {
    return {
      ...timetable,
      unassignedApplicantIds,
      interviews: interviews.map((interview) =>
        interview.id === targetInterview.id
          ? { ...interview, applicantIds: [...interview.applicantIds, ...item.applicantIds] }
          : interview,
      ),
    }
  }

  const isMovingWholeInterview =
    source !== undefined && source.applicantIds.every((id) => item.applicantIds.includes(id))

  // 카드째 옮기면 면접관도 함께, 옮긴 시간에 다른 면접이 있는 면접관은 제외
  if (isMovingWholeInterview) {
    const movedInterview = { ...source, ...target.slot }
    const busyInterviewers = getBusyInterviewers({ ...timetable, interviews }, movedInterview)

    return {
      ...timetable,
      unassignedApplicantIds,
      interviews: [
        ...interviews,
        {
          ...movedInterview,
          interviewerIds: source.interviewerIds.filter((id) => !busyInterviewers.has(id)),
        },
      ],
    }
  }

  const newInterview: TimetableInterview = {
    id: newInterviewId,
    ...target.slot,
    applicantIds: item.applicantIds,
    interviewerIds: [],
  }

  return { ...timetable, unassignedApplicantIds, interviews: [...interviews, newInterview] }
}

function addTrack(timetable: InterviewTimetable, date: string): InterviewTimetable {
  return {
    ...timetable,
    days: timetable.days.map((day) =>
      day.date === date ? { ...day, trackCount: day.trackCount + 1 } : day,
    ),
  }
}

function setInterviewers(
  timetable: InterviewTimetable,
  interviewId: string,
  interviewerIds: string[],
): InterviewTimetable {
  return {
    ...timetable,
    interviews: timetable.interviews.map((interview) =>
      interview.id === interviewId ? { ...interview, interviewerIds } : interview,
    ),
  }
}

// 다시 생성해도 운영진이 추가한 면접 열은 유지
function keepAddedTracks(
  generated: InterviewTimetable,
  current: InterviewTimetable,
): InterviewTimetable {
  return {
    ...generated,
    days: generated.days.map((day) => {
      const currentDay = current.days.find(({ date }) => date === day.date)
      return { ...day, trackCount: Math.max(day.trackCount, currentDay?.trackCount ?? 0) }
    }),
  }
}

// 확정 확인 요약, 예) 10/21 (수) ~ 10/23 (금) · 22명
function formatTimetableSummary(timetable: InterviewTimetable) {
  const firstDate = timetable.days.at(0)?.date
  const lastDate = timetable.days.at(-1)?.date
  const totalCount = timetable.days.reduce(
    (count, day) => count + getAssignedCount(timetable, day.date),
    0,
  )

  if (!firstDate || !lastDate) {
    return `${totalCount}명`
  }

  const period =
    firstDate === lastDate
      ? formatMonthDayWithWeekday(firstDate)
      : `${formatMonthDayWithWeekday(firstDate)} ~ ${formatMonthDayWithWeekday(lastDate)}`

  return `${period} · ${totalCount}명`
}

export {
  addTrack,
  findInterviewAt,
  formatAvailability,
  formatTimetableSummary,
  getAssignedCount,
  getAvailableEmptySlotKeys,
  getBusyInterviewers,
  getDatesOfSlotKeys,
  getDatesWithUnassignedApplicants,
  getInterviewsWithoutInterviewers,
  getSlotKey,
  getTrackLabel,
  keepAddedTracks,
  moveApplicants,
  setInterviewers,
}

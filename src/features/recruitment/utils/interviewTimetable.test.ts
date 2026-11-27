import { describe, expect, it } from 'vitest'
import type {
  InterviewTimetable,
  TimetableApplicant,
  TimetableInterview,
} from '@/features/recruitment/types'
import {
  addTrack,
  formatAvailability,
  formatTimetableSummary,
  getAssignedCount,
  getAvailableEmptySlotKeys,
  getBusyInterviewers,
  getDatesOfSlotKeys,
  getDatesWithUnassignedApplicants,
  getInterviewsWithoutInterviewers,
  keepAddedTracks,
  moveApplicants,
  setInterviewers,
} from './interviewTimetable'

const DAY_1 = '2026-10-21'
const DAY_2 = '2026-10-22'

function createInterview(
  overrides: Partial<TimetableInterview> & Pick<TimetableInterview, 'id'>,
): TimetableInterview {
  return {
    date: DAY_1,
    time: '13:00',
    track: 1,
    applicantIds: [],
    interviewerIds: [],
    ...overrides,
  }
}

function createApplicant(
  id: string,
  availableTimes: TimetableApplicant['availableTimes'],
): TimetableApplicant {
  return { id, name: id, positionName: null, availableTimes }
}

function createTimetable(overrides: Partial<InterviewTimetable> = {}): InterviewTimetable {
  return {
    days: [
      { date: DAY_1, times: ['13:00', '13:25'], trackCount: 2 },
      { date: DAY_2, times: ['13:00'], trackCount: 1 },
    ],
    interviews: [
      createInterview({ id: 'a', applicantIds: ['kim'], interviewerIds: ['host'] }),
      createInterview({ id: 'b', track: 2, applicantIds: ['lee', 'park'] }),
    ],
    unassignedApplicantIds: ['choi'],
    ...overrides,
  }
}

describe('moveApplicants', () => {
  it('미배정 지원자를 빈 칸에 놓으면 면접관 없는 새 면접 생성', () => {
    const result = moveApplicants(
      createTimetable(),
      { applicantIds: ['choi'], fromInterviewId: null },
      { type: 'slot', slot: { date: DAY_1, time: '13:25', track: 1 } },
      'new',
    )

    expect(result.unassignedApplicantIds).toEqual([])
    expect(result.interviews).toContainEqual(
      createInterview({ id: 'new', time: '13:25', applicantIds: ['choi'] }),
    )
  })

  it('배정된 칸에 놓으면 그 칸의 그룹 면접으로 합침', () => {
    const result = moveApplicants(
      createTimetable(),
      { applicantIds: ['choi'], fromInterviewId: null },
      { type: 'slot', slot: { date: DAY_1, time: '13:00', track: 1 } },
      'new',
    )

    expect(result.interviews.find(({ id }) => id === 'a')?.applicantIds).toEqual(['kim', 'choi'])
    expect(result.interviews).toHaveLength(2)
  })

  it('카드째 빈 칸으로 옮기면 같은 면접과 면접관 유지', () => {
    const result = moveApplicants(
      createTimetable(),
      { applicantIds: ['kim'], fromInterviewId: 'a' },
      { type: 'slot', slot: { date: DAY_2, time: '13:00', track: 1 } },
      'new',
    )

    expect(result.interviews.find(({ id }) => id === 'a')).toEqual(
      createInterview({ id: 'a', date: DAY_2, applicantIds: ['kim'], interviewerIds: ['host'] }),
    )
  })

  it('옮긴 시간에 다른 면접에 있는 면접관은 카드에서 제외', () => {
    const timetable = createTimetable({
      interviews: [
        createInterview({ id: 'a', applicantIds: ['kim'], interviewerIds: ['host', 'free'] }),
        createInterview({
          id: 'b',
          time: '13:25',
          applicantIds: ['lee'],
          interviewerIds: ['host'],
        }),
      ],
    })

    const result = moveApplicants(
      timetable,
      { applicantIds: ['kim'], fromInterviewId: 'a' },
      { type: 'slot', slot: { date: DAY_1, time: '13:25', track: 2 } },
      'new',
    )

    expect(result.interviews.find(({ id }) => id === 'a')?.interviewerIds).toEqual(['free'])
  })

  it('그룹에서 한 명만 옮기면 남은 지원자는 그 칸에 그대로', () => {
    const result = moveApplicants(
      createTimetable(),
      { applicantIds: ['park'], fromInterviewId: 'b' },
      { type: 'slot', slot: { date: DAY_1, time: '13:25', track: 2 } },
      'new',
    )

    expect(result.interviews.find(({ id }) => id === 'b')?.applicantIds).toEqual(['lee'])
    expect(result.interviews.find(({ id }) => id === 'new')?.applicantIds).toEqual(['park'])
  })

  it('미배정 바에 놓으면 미배정으로 되돌리고 빈 면접은 삭제', () => {
    const result = moveApplicants(
      createTimetable(),
      { applicantIds: ['kim'], fromInterviewId: 'a' },
      { type: 'unassigned' },
      'new',
    )

    expect(result.unassignedApplicantIds).toEqual(['choi', 'kim'])
    expect(result.interviews.map(({ id }) => id)).toEqual(['b'])
  })

  it('같은 칸이나 미배정 바로 다시 놓으면 그대로', () => {
    const timetable = createTimetable()

    expect(
      moveApplicants(
        timetable,
        { applicantIds: ['kim'], fromInterviewId: 'a' },
        { type: 'slot', slot: { date: DAY_1, time: '13:00', track: 1 } },
        'new',
      ),
    ).toBe(timetable)
    expect(
      moveApplicants(
        timetable,
        { applicantIds: ['choi'], fromInterviewId: null },
        { type: 'unassigned' },
        'new',
      ),
    ).toBe(timetable)
  })
})

describe('getAvailableEmptySlotKeys', () => {
  it('옮기는 지원자 모두가 가능한 빈 칸만 반환', () => {
    const timetable = createTimetable()
    const applicants = [
      createApplicant('choi', [
        { date: DAY_1, time: '13:00' },
        { date: DAY_1, time: '13:25' },
      ]),
      createApplicant('jung', [{ date: DAY_1, time: '13:25' }]),
    ]

    expect(getAvailableEmptySlotKeys(timetable, applicants)).toEqual(
      new Set([`${DAY_1} 13:25 1`, `${DAY_1} 13:25 2`]),
    )
  })

  it('옮기는 지원자가 없으면 빈 결과', () => {
    expect(getAvailableEmptySlotKeys(createTimetable(), [])).toEqual(new Set())
  })
})

describe('getDatesOfSlotKeys', () => {
  it('칸이 있는 날짜만 반환', () => {
    expect(getDatesOfSlotKeys(createTimetable(), new Set([`${DAY_2} 13:00 1`]))).toEqual(
      new Set([DAY_2]),
    )
  })
})

describe('getDatesWithUnassignedApplicants', () => {
  it('미배정 지원자가 가능한 날짜 반환', () => {
    const applicantsById = new Map([
      ['choi', createApplicant('choi', [{ date: DAY_2, time: '13:00' }])],
      ['kim', createApplicant('kim', [{ date: DAY_1, time: '13:00' }])],
    ])

    expect(getDatesWithUnassignedApplicants(createTimetable(), applicantsById)).toEqual(
      new Set([DAY_2]),
    )
  })
})

describe('getInterviewsWithoutInterviewers', () => {
  it('면접관이 한 명도 없는 면접만 반환', () => {
    expect(getInterviewsWithoutInterviewers(createTimetable()).map(({ id }) => id)).toEqual(['b'])
  })
})

describe('getBusyInterviewers', () => {
  it('같은 시간 다른 면접의 면접관만 반환', () => {
    const timetable = createTimetable({
      interviews: [
        createInterview({ id: 'a', applicantIds: ['kim'] }),
        createInterview({ id: 'b', track: 2, applicantIds: ['lee'], interviewerIds: ['host'] }),
        createInterview({
          id: 'c',
          time: '13:25',
          applicantIds: ['park'],
          interviewerIds: ['sub'],
        }),
      ],
    })
    const [interview] = timetable.interviews

    expect(interview && [...getBusyInterviewers(timetable, interview).keys()]).toEqual(['host'])
  })
})

describe('formatAvailability', () => {
  it('가능한 시간이 하나면 날짜·요일·시각 표시', () => {
    expect(formatAvailability([{ date: DAY_2, time: '15:05' }])).toBe('10/22 (목) 15:05 가능')
  })

  it('여러 개면 날짜만 순서대로 모아 표시', () => {
    expect(
      formatAvailability([
        { date: DAY_2, time: '13:00' },
        { date: DAY_1, time: '13:00' },
        { date: DAY_2, time: '13:25' },
      ]),
    ).toBe('10/21, 10/22 가능')
  })

  it('가능한 시간이 없으면 null', () => {
    expect(formatAvailability([])).toBeNull()
  })
})

describe('그 밖의 타임테이블 계산', () => {
  it('날짜별 배정 인원은 그룹 면접 인원까지 셈', () => {
    expect(getAssignedCount(createTimetable(), DAY_1)).toBe(3)
    expect(getAssignedCount(createTimetable(), DAY_2)).toBe(0)
  })

  it('면접 추가는 그 날짜에만 열 추가', () => {
    expect(addTrack(createTimetable(), DAY_2).days.map(({ trackCount }) => trackCount)).toEqual([
      2, 2,
    ])
  })

  it('면접관 변경은 해당 면접에만 반영', () => {
    const result = setInterviewers(createTimetable(), 'b', ['host'])

    expect(result.interviews.map(({ interviewerIds }) => interviewerIds)).toEqual([
      ['host'],
      ['host'],
    ])
  })

  it('다시 생성해도 추가한 면접 열 유지', () => {
    const current = addTrack(createTimetable(), DAY_1)

    expect(keepAddedTracks(createTimetable(), current).days[0]?.trackCount).toBe(3)
  })

  it('확정 요약은 첫날~마지막 날과 그룹 면접까지 센 인원', () => {
    expect(formatTimetableSummary(createTimetable())).toBe('10/21 (수) ~ 10/22 (목) · 3명')
  })

  it('하루짜리 타임테이블은 날짜 하나만 표시', () => {
    const timetable = createTimetable({
      days: [{ date: DAY_1, times: ['13:00'], trackCount: 2 }],
    })

    expect(formatTimetableSummary(timetable)).toBe('10/21 (수) · 3명')
  })
})

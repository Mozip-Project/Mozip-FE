import { describe, expect, it } from 'vitest'
import {
  applySlotRange,
  countInterviews,
  countInterviewsInBlock,
  getSlotBlocks,
  getSlotEndTime,
  getSlotKey,
  getSlotRangeKeys,
  groupSlotKeysByDate,
  hasDateGap,
  isSamePosition,
  TIMETABLE_HOUR_LABELS,
  TIMETABLE_SLOT_TIMES,
} from './interviewTimetable'

const DATES = ['2026-10-23', '2026-10-26']

describe('interviewTimetable', () => {
  it('9시부터 22시까지 30분 칸 26개, 시간 라벨은 정각 13개', () => {
    expect(TIMETABLE_SLOT_TIMES).toHaveLength(26)
    expect(TIMETABLE_SLOT_TIMES.at(0)).toBe('09:00')
    expect(TIMETABLE_SLOT_TIMES.at(-1)).toBe('21:30')
    expect(TIMETABLE_HOUR_LABELS).toHaveLength(13)
    expect(TIMETABLE_HOUR_LABELS.at(-1)).toBe('21:00')
    expect(getSlotEndTime('21:30')).toBe('22:00')
  })

  it('칸 위치를 날짜·시간 키로 변환하고 같은 칸인지 비교', () => {
    expect(getSlotKey(DATES, { dateIndex: 1, slotIndex: 2 })).toBe('2026-10-26T10:00')
    expect(isSamePosition({ dateIndex: 0, slotIndex: 1 }, { dateIndex: 0, slotIndex: 1 })).toBe(
      true,
    )
    expect(isSamePosition({ dateIndex: 0, slotIndex: 1 }, { dateIndex: 1, slotIndex: 1 })).toBe(
      false,
    )
  })

  it('드래그 범위는 방향과 관계없이 두 칸을 꼭짓점으로 한 사각형', () => {
    expect(
      getSlotRangeKeys(DATES, { dateIndex: 1, slotIndex: 1 }, { dateIndex: 0, slotIndex: 0 }),
    ).toEqual(['2026-10-23T09:00', '2026-10-23T09:30', '2026-10-26T09:00', '2026-10-26T09:30'])
  })

  it('선택·해제 범위를 적용하고 정렬', () => {
    const selected = applySlotRange(['2026-10-26T10:00'], ['2026-10-23T09:00'], true)

    expect(selected).toEqual(['2026-10-23T09:00', '2026-10-26T10:00'])
    expect(applySlotRange(selected, ['2026-10-26T10:00'], false)).toEqual(['2026-10-23T09:00'])
  })

  it('하루 이상 떨어진 날짜 사이만 간격', () => {
    expect(hasDateGap('2026-10-23', '2026-10-24')).toBe(false)
    expect(hasDateGap('2026-10-23', '2026-10-26')).toBe(true)
    expect(hasDateGap('2026-10-31', '2026-11-01')).toBe(false)
  })

  it('이어진 칸마다 면접 + 쉬는 시간이 들어가는 횟수, 마지막 쉬는 시간은 불필요', () => {
    const twoHours = ['09:00', '09:30', '10:00', '10:30'].map((time) => `2026-10-23T${time}`)

    expect(countInterviews(twoHours, 30, 0)).toBe(4)
    expect(countInterviews(twoHours, 30, 10)).toBe(3)
    expect(countInterviews(twoHours, 60, 0)).toBe(2)
    expect(countInterviews(twoHours.slice(0, 1), 40, 0)).toBe(0)
  })

  it('떨어진 칸과 다른 날짜는 따로 계산해 합산', () => {
    const slots = ['2026-10-23T09:00', '2026-10-23T10:00', '2026-10-26T09:00', '2026-10-26T09:30']

    expect(countInterviews(slots, 60, 0)).toBe(1)
    expect(countInterviews(slots, 30, 0)).toBe(4)
  })

  it('날짜별로 이어진 칸을 묶음으로 나누고, 묶음마다 횟수 계산', () => {
    const slots = [
      '2026-10-23T10:00',
      '2026-10-23T09:00',
      '2026-10-23T09:30',
      '2026-10-23T13:00',
      '2026-10-26T09:00',
    ]
    const blocks = getSlotBlocks('2026-10-23', slots)

    expect(blocks).toEqual([
      { startIndex: 0, length: 3 },
      { startIndex: 8, length: 1 },
    ])
    // 30분 면접·쉬는 시간 0분, 1시간 30분 묶음은 3회
    expect(countInterviewsInBlock({ startIndex: 0, length: 2 }, 30, 0)).toBe(2)
    expect(blocks.map((block) => countInterviewsInBlock(block, 30, 0))).toEqual([3, 1])
    expect(countInterviewsInBlock({ startIndex: 0, length: 4 }, 40, 10)).toBe(2)
  })
})

describe('groupSlotKeysByDate', () => {
  it('날짜별로 묶고 날짜·시각 순으로 정렬', () => {
    expect(
      groupSlotKeysByDate([
        '2026-10-22T14:00',
        '2026-10-21T13:30',
        '2026-10-21T13:00',
        '2026-10-22T13:30',
      ]),
    ).toEqual([
      { date: '2026-10-21', slotKeys: ['2026-10-21T13:00', '2026-10-21T13:30'] },
      { date: '2026-10-22', slotKeys: ['2026-10-22T13:30', '2026-10-22T14:00'] },
    ])
  })

  it('칸이 없으면 빈 배열', () => {
    expect(groupSlotKeysByDate([])).toEqual([])
  })
})

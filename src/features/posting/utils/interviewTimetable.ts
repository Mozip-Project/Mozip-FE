import { addDays } from '@/utils/calendar'
import { toTimeValue } from '@/utils/time'

const TIMETABLE_START_HOUR = 9
const TIMETABLE_END_HOUR = 22
const SLOT_MINUTES = 30
const MINUTES_PER_HOUR = 60

type SlotPosition = { dateIndex: number; slotIndex: number }

const TIMETABLE_SLOT_TIMES = Array.from(
  { length: ((TIMETABLE_END_HOUR - TIMETABLE_START_HOUR) * MINUTES_PER_HOUR) / SLOT_MINUTES },
  (_, index) => toTimeValue(TIMETABLE_START_HOUR * MINUTES_PER_HOUR + index * SLOT_MINUTES),
)

const TIMETABLE_HOUR_LABELS = TIMETABLE_SLOT_TIMES.filter((_, index) => index % 2 === 0)

function toSlotKey(date: string, time: string) {
  return `${date}T${time}`
}

function getSlotDate(slotKey: string) {
  return slotKey.slice(0, 10)
}

function getSlotEndTime(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)

  return toTimeValue(hours * MINUTES_PER_HOUR + minutes + SLOT_MINUTES)
}

// 드래그 시작·현재 칸을 꼭짓점으로 하는 사각형 범위
function getSlotRangeKeys(dates: string[], from: SlotPosition, to: SlotPosition) {
  const keys: string[] = []

  for (
    let dateIndex = Math.min(from.dateIndex, to.dateIndex);
    dateIndex <= Math.max(from.dateIndex, to.dateIndex);
    dateIndex += 1
  ) {
    for (
      let slotIndex = Math.min(from.slotIndex, to.slotIndex);
      slotIndex <= Math.max(from.slotIndex, to.slotIndex);
      slotIndex += 1
    ) {
      const date = dates[dateIndex]
      const time = TIMETABLE_SLOT_TIMES[slotIndex]
      if (date && time) {
        keys.push(toSlotKey(date, time))
      }
    }
  }

  return keys
}

function applySlotRange(slotKeys: string[], rangeKeys: string[], isSelecting: boolean) {
  const nextKeys = new Set(slotKeys)
  for (const key of rangeKeys) {
    if (isSelecting) {
      nextKeys.add(key)
    } else {
      nextKeys.delete(key)
    }
  }

  return [...nextKeys].sort()
}

function hasDateGap(previousDate: string, date: string) {
  return addDays(previousDate, 1) !== date
}

type SlotBlock = { startIndex: number; length: number }

// 한 날짜에서 이어진 30분 칸 묶음
function getSlotBlocks(date: string, slotKeys: string[]): SlotBlock[] {
  const indexes = TIMETABLE_SLOT_TIMES.flatMap((time, index) =>
    slotKeys.includes(toSlotKey(date, time)) ? [index] : [],
  )
  const blocks: SlotBlock[] = []

  for (const index of indexes) {
    const lastBlock = blocks.at(-1)
    if (lastBlock && lastBlock.startIndex + lastBlock.length === index) {
      lastBlock.length += 1
    } else {
      blocks.push({ startIndex: index, length: 1 })
    }
  }

  return blocks
}

// 마지막 면접 뒤에는 쉬는 시간이 필요 없어 (길이 + 쉬는 시간) / (면접 + 쉬는 시간)
function countInterviewsInBlock(block: SlotBlock, durationMinutes: number, breakMinutes: number) {
  if (durationMinutes <= 0) {
    return 0
  }
  return Math.floor((block.length * SLOT_MINUTES + breakMinutes) / (durationMinutes + breakMinutes))
}

function countInterviews(slotKeys: string[], durationMinutes: number, breakMinutes: number) {
  const dates = new Set(slotKeys.map(getSlotDate))

  return [...dates].reduce(
    (total, date) =>
      total +
      getSlotBlocks(date, slotKeys).reduce(
        (sum, block) => sum + countInterviewsInBlock(block, durationMinutes, breakMinutes),
        0,
      ),
    0,
  )
}

export {
  applySlotRange,
  countInterviews,
  countInterviewsInBlock,
  getSlotBlocks,
  getSlotDate,
  getSlotEndTime,
  getSlotRangeKeys,
  hasDateGap,
  TIMETABLE_HOUR_LABELS,
  TIMETABLE_SLOT_TIMES,
  toSlotKey,
}
export type { SlotBlock, SlotPosition }

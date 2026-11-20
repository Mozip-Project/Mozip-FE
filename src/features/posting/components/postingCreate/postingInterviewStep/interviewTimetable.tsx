'use client'

import { Fragment, useState, type MouseEvent, type PointerEvent } from 'react'
import { toInterviewDay } from '@/features/posting/utils/interviewPeriod'
import {
  applySlotRange,
  countInterviewsInBlock,
  getSlotBlocks,
  getSlotEndTime,
  getSlotKey,
  getSlotRangeKeys,
  hasDateGap,
  isSamePosition,
  TIMETABLE_HOUR_LABELS,
  TIMETABLE_SLOT_TIMES,
  toSlotKey,
  type SlotPosition,
} from '@/features/posting/utils/interviewTimetable'
import { cn } from '@/lib/utils'
import { formatCalendarDateLabel } from '@/utils/calendar'
import { formatMonthDay } from '@/utils/date'

type DragState = { from: SlotPosition; to: SlotPosition; isSelecting: boolean }

const SLOT_HEIGHT_PX = 28
const BLOCK_LABEL_OFFSET_PX = 8

type InterviewTimetableProps = {
  dates: string[]
  selectedSlots: string[]
  onSelectedSlotsChange: (slots: string[]) => void
  durationMinutes: number | null
  breakMinutes: number | null
}

function InterviewTimetable({
  dates,
  selectedSlots,
  onSelectedSlotsChange,
  durationMinutes,
  breakMinutes,
}: InterviewTimetableProps) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const selectedSet = new Set(selectedSlots)
  const dragRange = new Set(drag ? getSlotRangeKeys(dates, drag.from, drag.to) : [])

  function isSlotSelected(key: string) {
    if (dragRange.has(key) && drag) {
      return drag.isSelecting
    }
    return selectedSet.has(key)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const position = getSlotPosition(event.target)
    if (!position || event.button !== 0) {
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const key = getSlotKey(dates, position)
    setDrag({ from: position, to: position, isSelecting: !selectedSet.has(key) })
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag) {
      return
    }
    // 포인터 캡처 중에는 이벤트 대상이 고정돼 좌표로 현재 칸 탐색
    const position = getSlotPosition(document.elementFromPoint(event.clientX, event.clientY))
    if (position && !isSamePosition(position, drag.to)) {
      setDrag({ ...drag, to: position })
    }
  }

  function handlePointerUp() {
    if (!drag) {
      return
    }
    onSelectedSlotsChange(
      applySlotRange(selectedSlots, getSlotRangeKeys(dates, drag.from, drag.to), drag.isSelecting),
    )
    setDrag(null)
  }

  // 포인터 선택은 드래그로 처리, 키보드(Enter·Space)만 한 칸씩 토글
  function handleKeyboardToggle(event: MouseEvent<HTMLButtonElement>, key: string) {
    if (event.detail !== 0) {
      return
    }
    onSelectedSlotsChange(applySlotRange(selectedSlots, [key], !selectedSet.has(key)))
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDrag(null)}
      className="flex h-198 touch-none overflow-hidden rounded-l border border-neutral-muted bg-layer-default select-none"
    >
      <div aria-hidden className="flex w-16 shrink-0 flex-col">
        <div className="h-16 shrink-0 border-b border-neutral-muted" />
        {TIMETABLE_HOUR_LABELS.map((time) => (
          <div
            key={time}
            className="h-14 shrink-0 border-b border-neutral-subtle pt-1.5 pl-3 text-caption1 font-medium text-neutral-subtle"
          >
            {time}
          </div>
        ))}
      </div>
      {dates.map((date, dateIndex) => {
        const previousDate = dates[dateIndex - 1]
        const day = toInterviewDay(date)
        // 드래그 중인 범위까지 반영해 묶음과 횟수를 바로 갱신
        const displayedKeys = TIMETABLE_SLOT_TIMES.map((time) => toSlotKey(date, time)).filter(
          isSlotSelected,
        )

        return (
          <Fragment key={date}>
            {previousDate && hasDateGap(previousDate, date) && (
              <div aria-hidden className="w-3 shrink-0 bg-neutral-weak" />
            )}
            <div
              role="group"
              aria-label={formatCalendarDateLabel(date)}
              className="flex min-w-0 flex-1 flex-col border-l border-neutral-subtle"
            >
              <div
                aria-hidden
                className={cn(
                  'flex h-16 shrink-0 flex-col items-center justify-center border-b border-neutral-muted font-medium whitespace-nowrap',
                  day.isSunday ? 'text-critical' : 'text-neutral',
                )}
              >
                <span className={cn('text-label2', !day.isSunday && 'text-neutral-subtle')}>
                  {day.weekday}
                </span>
                <span className="text-body1">{formatMonthDay(date)}</span>
              </div>
              <div className="relative flex flex-col">
                {TIMETABLE_SLOT_TIMES.map((time, slotIndex) => {
                  const key = toSlotKey(date, time)
                  const isSelected = isSlotSelected(key)

                  return (
                    <button
                      key={time}
                      type="button"
                      data-date-index={dateIndex}
                      data-slot-index={slotIndex}
                      aria-label={`${time}~${getSlotEndTime(time)}`}
                      aria-pressed={selectedSet.has(key)}
                      onClick={(event) => handleKeyboardToggle(event, key)}
                      className={cn(
                        'h-7 w-full shrink-0 cursor-pointer border-b border-neutral-subtle outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
                        // 정각~30분 칸 아래는 점선으로 30분 구분
                        slotIndex % 2 === 0 && 'border-dashed',
                        isSelected && 'bg-brand-weak-pressed',
                      )}
                    />
                  )
                })}
                {durationMinutes !== null &&
                  breakMinutes !== null &&
                  getSlotBlocks(date, displayedKeys).map((block) => (
                    <span
                      key={block.startIndex}
                      aria-hidden
                      className="pointer-events-none absolute left-2.25 text-label2 font-medium whitespace-nowrap text-brand-contrast"
                      style={{ top: block.startIndex * SLOT_HEIGHT_PX + BLOCK_LABEL_OFFSET_PX }}
                    >
                      면접 {countInterviewsInBlock(block, durationMinutes, breakMinutes)}회 가능
                    </span>
                  ))}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

function getSlotPosition(target: EventTarget | null): SlotPosition | null {
  if (!(target instanceof HTMLElement)) {
    return null
  }
  const cell = target.closest<HTMLElement>('[data-slot-index]')
  if (!cell) {
    return null
  }
  return {
    dateIndex: Number(cell.dataset.dateIndex),
    slotIndex: Number(cell.dataset.slotIndex),
  }
}

export { InterviewTimetable }

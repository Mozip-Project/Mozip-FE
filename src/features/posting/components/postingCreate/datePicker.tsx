'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { cn } from '@/lib/utils'
import {
  addDays,
  getCalendarMonth,
  getCalendarWeeks,
  getFirstDateOfMonth,
  getTodayIsoDate,
  isInCalendarMonth,
  shiftMonth,
} from '@/utils/calendar'
import { WEEKDAY_LABELS } from '@/utils/date'
import { CalendarDay } from './calendarDay'

const KEY_DAY_OFFSET: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

type DatePickerProps = {
  value: string | null
  onValueChange: (date: string) => void
  autoFocus?: boolean
  className?: string
}

function DatePicker({ value, onValueChange, autoFocus = false, className }: DatePickerProps) {
  const [focusedDate, setFocusedDate] = useState(() => value ?? getTodayIsoDate())
  const [viewMonth, setViewMonth] = useState(() => getCalendarMonth(focusedDate))
  const gridRef = useRef<HTMLTableElement>(null)
  const shouldMoveFocusRef = useRef(autoFocus)

  const weeks = getCalendarWeeks(viewMonth)
  const activeDate = isInCalendarMonth(focusedDate, viewMonth)
    ? focusedDate
    : getFirstDateOfMonth(viewMonth)

  useEffect(() => {
    if (!shouldMoveFocusRef.current) {
      return
    }
    shouldMoveFocusRef.current = false
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${activeDate}"]`)?.focus()
  }, [activeDate])

  function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const offset = KEY_DAY_OFFSET[event.key]

    if (offset === undefined) {
      return
    }
    event.preventDefault()
    const nextDate = addDays(activeDate, offset)
    shouldMoveFocusRef.current = true
    setFocusedDate(nextDate)
    setViewMonth(getCalendarMonth(nextDate))
  }

  return (
    <div className={cn('flex w-70 flex-col gap-gap-s', className)}>
      <div className="flex h-10 items-center gap-gap-m px-1.5">
        <p aria-live="polite" className="flex-1 text-body1 font-semibold text-neutral">
          {viewMonth.year}년 {viewMonth.month}월
        </p>
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
          className="cursor-pointer rounded-xs text-neutral outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          <ChevronLeftIcon aria-hidden />
        </button>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
          className="cursor-pointer rounded-xs text-neutral outline-none focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
        >
          <ChevronRightIcon aria-hidden />
        </button>
      </div>
      <table ref={gridRef} onKeyDown={handleGridKeyDown} className="border-collapse">
        <thead>
          <tr>
            {WEEKDAY_LABELS.map((weekday, index) => (
              <th
                key={weekday}
                scope="col"
                abbr={`${weekday}요일`}
                className={cn(
                  'h-10 w-10 p-0 pb-2 text-label2 font-medium',
                  index === 0 ? 'text-critical' : 'text-neutral-subtle',
                )}
              >
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]?.date}>
              {week.map((calendarDate) => (
                <td key={calendarDate.date} className="p-0">
                  <CalendarDay
                    calendarDate={calendarDate}
                    isSelected={calendarDate.date === value}
                    isFocusTarget={calendarDate.date === activeDate}
                    onSelect={onValueChange}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { DatePicker }
export type { DatePickerProps }

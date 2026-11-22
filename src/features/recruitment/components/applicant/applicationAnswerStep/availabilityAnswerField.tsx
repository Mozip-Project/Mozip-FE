'use client'

import { useId } from 'react'
import { getSlotEndTime, groupSlotKeysByDate } from '@/features/posting/utils/interviewTimetable'
import { formatMonthDayWithWeekday } from '@/utils/date'
import { toggleInOrder } from '@/utils/toggleInOrder'
import { TimeChip } from './timeChip'

type AvailabilityAnswerFieldProps = {
  // 운영진이 연 30분 칸 시작 시각('YYYY-MM-DDTHH:mm')
  interviewSlots: readonly string[]
  // 고른 칸, interviewSlots와 같은 형식
  value: readonly string[]
  onChange: (value: string[]) => void
}

function AvailabilityAnswerField({
  interviewSlots,
  value,
  onChange,
}: AvailabilityAnswerFieldProps) {
  const dateLabelIdPrefix = useId()
  const slotGroups = groupSlotKeysByDate(interviewSlots)
  const slotOrder = slotGroups.flatMap(({ slotKeys }) => slotKeys)

  function handleSlotToggle(slotKey: string, isSelected: boolean) {
    onChange(toggleInOrder(slotOrder, value, slotKey, isSelected))
  }

  return (
    <div className="flex flex-col">
      {slotGroups.map(({ date, slotKeys }) => {
        const dateLabelId = `${dateLabelIdPrefix}-${date}`

        return (
          <div
            key={date}
            role="group"
            aria-labelledby={dateLabelId}
            className="flex items-start gap-gap-l border-b border-neutral-subtle py-4 last:border-b-0"
          >
            <p id={dateLabelId} className="w-22 shrink-0 text-label1 font-semibold text-neutral">
              {formatMonthDayWithWeekday(date)}
            </p>
            <div className="flex min-w-0 flex-1 flex-wrap gap-gap-s">
              {slotKeys.map((slotKey) => {
                const startTime = slotKey.slice(11, 16)

                return (
                  <TimeChip
                    key={slotKey}
                    pressed={value.includes(slotKey)}
                    onPressedChange={(isSelected) => handleSlotToggle(slotKey, isSelected)}
                  >
                    {startTime} ~ {getSlotEndTime(startTime)}
                  </TimeChip>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { AvailabilityAnswerField }

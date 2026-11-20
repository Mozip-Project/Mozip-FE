import { useId } from 'react'
import { cn } from '@/lib/utils'
import {
  createTimeOptions,
  formatTimeLabel,
  getDefaultTime,
  type TimeOptionType,
} from '@/utils/time'
import { DateField } from './dateField'
import { FieldLabel } from './fieldLabel'
import { SelectField } from './selectField'

const TIME_OPTION_INTERVAL_MINUTES = 30

const TIME_OPTIONS = {
  start: createTimeOptions(TIME_OPTION_INTERVAL_MINUTES, 'start'),
  end: createTimeOptions(TIME_OPTION_INTERVAL_MINUTES, 'end'),
} satisfies Record<TimeOptionType, ReturnType<typeof createTimeOptions>>

type DateTimeFieldProps = {
  label: string
  date: string | null
  onDateChange: (date: string) => void
  time: string | null
  timeType: TimeOptionType
  onTimeChange: (time: string) => void
  minDate?: string | null
  required?: boolean
  className?: string
}

function DateTimeField({
  label,
  date,
  onDateChange,
  time,
  timeType,
  onTimeChange,
  minDate,
  required = false,
  className,
}: DateTimeFieldProps) {
  const labelId = useId()
  const defaultTime = getDefaultTime(timeType)

  // 날짜를 처음 고르면 시간 안내값(시작 00:00, 마감 23:59)을 실제 값으로 채움
  function handleDateChange(nextDate: string) {
    onDateChange(nextDate)
    if (!time) {
      onTimeChange(defaultTime)
    }
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={cn('flex flex-col gap-gap-s', className)}
    >
      <FieldLabel id={labelId} label={label} required={required} />
      <div className="flex gap-gap-s">
        <DateField
          className="min-w-0 flex-1"
          label="날짜"
          isLabelHidden
          value={date}
          onValueChange={handleDateChange}
          minDate={minDate}
        />
        <SelectField
          className="w-41 shrink-0"
          label="시간"
          isLabelHidden
          placeholder={formatTimeLabel(defaultTime)}
          options={TIME_OPTIONS[timeType]}
          value={time}
          onValueChange={onTimeChange}
        />
      </div>
    </div>
  )
}

export { DateTimeField }
export type { DateTimeFieldProps }

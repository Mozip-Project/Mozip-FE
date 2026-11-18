import { useId } from 'react'
import { DateField } from '@/components/ui/DateField/dateField'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import { SelectField } from '@/components/ui/SelectField/selectField'
import { cn } from '@/lib/utils'
import { createTimeOptions, type TimeOptionType } from '@/utils/time'

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
  timePlaceholder?: string
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
  timePlaceholder,
  required = false,
  className,
}: DateTimeFieldProps) {
  const labelId = useId()

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
          onValueChange={onDateChange}
        />
        <SelectField
          className="w-41 shrink-0"
          label="시간"
          isLabelHidden
          placeholder={timePlaceholder}
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

import { cn } from '@/lib/utils'
import { formatCalendarDateLabel, type CalendarDate } from '@/utils/calendar'

type CalendarDayProps = {
  calendarDate: CalendarDate
  isSelected: boolean
  isFocusTarget: boolean
  onSelect: (date: string) => void
}

function CalendarDay({
  calendarDate: { date, day, isInMonth },
  isSelected,
  isFocusTarget,
  onSelect,
}: CalendarDayProps) {
  if (!isInMonth) {
    return (
      <span
        aria-hidden
        className="flex size-10 items-center justify-center text-label1 font-medium text-neutral-faint"
      >
        {day}
      </span>
    )
  }

  return (
    <button
      type="button"
      data-date={date}
      tabIndex={isFocusTarget ? 0 : -1}
      aria-label={formatCalendarDateLabel(date)}
      aria-pressed={isSelected}
      onClick={() => onSelect(date)}
      className="group flex size-10 cursor-pointer items-center justify-center outline-none"
    >
      <span
        className={cn(
          'flex size-8.5 items-center justify-center rounded-full text-label1 font-medium group-focus-visible:outline-2 group-focus-visible:outline-focus-ring group-focus-visible:outline-solid',
          isSelected
            ? 'bg-neutral-solid text-on-neutral-solid'
            : 'text-neutral group-hover:bg-transparent-pressed group-hover:text-neutral-muted',
        )}
      >
        {day}
      </span>
    </button>
  )
}

export { CalendarDay }

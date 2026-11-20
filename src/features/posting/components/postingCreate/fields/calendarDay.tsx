import { cn } from '@/lib/utils'
import { formatCalendarDateLabel, type CalendarDate } from '@/utils/calendar'

function getDayStateClass(isSelected: boolean, isDisabled: boolean) {
  if (isDisabled) {
    return 'text-neutral-faint'
  }
  if (isSelected) {
    return 'bg-neutral-solid text-on-neutral-solid'
  }
  return 'text-neutral group-hover:bg-transparent-pressed group-hover:text-neutral-muted'
}

type CalendarDayProps = {
  calendarDate: CalendarDate
  isSelected: boolean
  isDisabled: boolean
  isFocusTarget: boolean
  onSelect: (date: string) => void
}

function CalendarDay({
  calendarDate: { date, day, isInMonth },
  isSelected,
  isDisabled,
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
      aria-disabled={isDisabled || undefined}
      onClick={() => !isDisabled && onSelect(date)}
      className={cn(
        'group flex size-10 items-center justify-center outline-none',
        isDisabled ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'flex size-8.5 items-center justify-center rounded-full text-label1 font-medium group-focus-visible:outline-2 group-focus-visible:outline-focus-ring group-focus-visible:outline-solid',
          getDayStateClass(isSelected, isDisabled),
        )}
      >
        {day}
      </span>
    </button>
  )
}

export { CalendarDay }

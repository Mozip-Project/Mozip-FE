'use client'

import { useId, useState } from 'react'
import CalendarIcon from '@/assets/icons/calendar.svg'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover/popover'
import { FIELD_TRIGGER_CLASS } from '@/components/ui/SelectField/selectField.variants'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import { formatFullDateWithWeekday } from '@/utils/calendar'
import { DatePicker } from './datePicker'

const DATE_PICKER_OFFSET_PX = 8

type DateFieldProps = {
  label: string
  value: string | null
  onValueChange: (date: string) => void
  placeholder?: string
  minDate?: string | null
  required?: boolean
  isLabelHidden?: boolean
  className?: string
}

function DateField({
  label,
  value,
  onValueChange,
  placeholder = '날짜를 선택해 주세요',
  minDate = null,
  required = false,
  isLabelHidden = false,
  className,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const id = useId()
  const labelId = `${id}-label`
  const valueId = `${id}-value`
  const displayValue = value ? formatFullDateWithWeekday(value) : ''

  function handleDateSelect(date: string) {
    onValueChange(date)
    setIsOpen(false)
  }

  return (
    <div className={cn('flex flex-col gap-gap-s', className)}>
      <FieldLabel id={labelId} label={label} required={required} isHidden={isLabelHidden} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-labelledby={`${labelId} ${valueId}`}
            data-pointer-focus={isPointerFocus ? '' : undefined}
            onPointerDown={markPointerFocus}
            className={FIELD_TRIGGER_CLASS}
          >
            <span
              id={valueId}
              className={cn(
                'min-w-0 flex-1 truncate text-body2 font-normal',
                displayValue ? 'text-neutral' : 'text-placeholder',
              )}
            >
              {displayValue || placeholder}
            </span>
            <CalendarIcon aria-hidden className="shrink-0 text-neutral-subtle" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label={`${label} 선택`}
          sideOffset={DATE_PICKER_OFFSET_PX}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="border-neutral-muted p-padding-m"
        >
          <DatePicker value={value} onValueChange={handleDateSelect} minDate={minDate} autoFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateField }
export type { DateFieldProps }

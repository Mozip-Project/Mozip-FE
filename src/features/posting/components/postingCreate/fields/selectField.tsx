'use client'

import { useId } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import {
  SelectMenuContent,
  type SelectMenuOption,
} from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import { FieldLabel } from './fieldLabel'
import { FIELD_TRIGGER_CLASS } from './fieldTriggerClass'

const SELECT_MENU_OFFSET_PX = 8

type SelectFieldProps<TValue extends string> = {
  label: string
  options: readonly SelectMenuOption<TValue>[]
  value: TValue | null
  onValueChange: (value: TValue) => void
  placeholder?: string
  required?: boolean
  isLabelHidden?: boolean
  menuSide?: 'bottom'
  onOpenChange?: (isOpen: boolean) => void
  className?: string
}

function SelectField<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  placeholder = '',
  required = false,
  isLabelHidden = false,
  menuSide,
  onOpenChange,
  className,
}: SelectFieldProps<TValue>) {
  const id = useId()
  const labelId = `${id}-label`
  const valueId = `${id}-value`
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <div className={cn('flex flex-col gap-gap-s', className)}>
      <FieldLabel id={labelId} label={label} required={required} isHidden={isLabelHidden} />
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-labelledby={`${labelId} ${valueId}`}
            data-pointer-focus={isPointerFocus ? '' : undefined}
            onPointerDown={markPointerFocus}
            className={cn('group', FIELD_TRIGGER_CLASS)}
          >
            <span
              id={valueId}
              className={cn(
                'min-w-0 flex-1 truncate text-body2 font-normal',
                selectedLabel ? 'text-neutral' : 'text-placeholder',
              )}
            >
              {selectedLabel ?? placeholder}
            </span>
            <ChevronDownIcon
              aria-hidden
              className="size-4.5 shrink-0 text-neutral group-aria-expanded:rotate-180"
            />
          </button>
        </DropdownMenuTrigger>
        <SelectMenuContent
          options={options}
          value={value}
          onValueChange={onValueChange}
          sideOffset={SELECT_MENU_OFFSET_PX}
          side={menuSide}
          className={cn(
            'min-w-(--radix-dropdown-menu-trigger-width)',
            // 방향을 고정하면 남은 공간과 무관하게 목록 전체 표시
            menuSide
              ? 'max-h-109'
              : 'max-h-[min(--spacing(109),var(--radix-dropdown-menu-content-available-height))]',
          )}
        />
      </DropdownMenu>
    </div>
  )
}

export { SelectField }
export type { SelectFieldProps }

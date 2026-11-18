'use client'

import { useId } from 'react'
import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import { FieldLabel } from '@/components/ui/FieldLabel/fieldLabel'
import {
  SelectMenuContent,
  type SelectMenuOption,
} from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'

type SelectFieldProps<TValue extends string> = {
  label: string
  options: readonly SelectMenuOption<TValue>[]
  value: TValue | null
  onValueChange: (value: TValue) => void
  placeholder?: string
  required?: boolean
  isLabelHidden?: boolean
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-labelledby={`${labelId} ${valueId}`}
            data-pointer-focus={isPointerFocus ? '' : undefined}
            onPointerDown={markPointerFocus}
            className="group flex h-13 w-full cursor-pointer items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-m text-left transition-colors outline-none not-data-pointer-focus:focus-visible:border-neutral-solid aria-expanded:border-neutral-solid motion-reduce:transition-none"
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
          className="max-h-[min(--spacing(109),var(--radix-dropdown-menu-content-available-height))] min-w-(--radix-dropdown-menu-trigger-width)"
        />
      </DropdownMenu>
    </div>
  )
}

export { SelectField }
export type { SelectFieldProps }

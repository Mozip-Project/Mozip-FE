'use client'

import { useId, type ReactNode } from 'react'
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'

type SelectMenuOption<TValue extends string> = {
  value: TValue
  label: string
}

type SelectMenuContentProps<TValue extends string> = {
  options: readonly SelectMenuOption<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
  groupLabel?: string
  actions?: ReactNode
}

// SelectMenu, FilterSelect가 트리거만 다르고 같은 패널을 공유
function SelectMenuContent<TValue extends string>({
  options,
  value,
  onValueChange,
  groupLabel,
  actions,
}: SelectMenuContentProps<TValue>) {
  const groupLabelId = useId()

  function handleValueChange(nextValue: string) {
    const nextOption = options.find((option) => option.value === nextValue)

    if (nextOption) {
      onValueChange(nextOption.value)
    }
  }

  return (
    <DropdownMenuContent
      align="end"
      className="flex w-50 flex-col gap-gap-xxs rounded-m border-neutral-muted p-padding-xs"
    >
      {groupLabel && <DropdownMenuLabel id={groupLabelId}>{groupLabel}</DropdownMenuLabel>}

      <DropdownMenuRadioGroup
        aria-labelledby={groupLabel ? groupLabelId : undefined}
        className="flex flex-col gap-gap-xxs"
        value={value}
        onValueChange={handleValueChange}
      >
        {options.map((option) => (
          <DropdownMenuRadioItem key={option.value} value={option.value}>
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>

      {actions && (
        <>
          <DropdownMenuSeparator className="my-gap-xs" />
          {actions}
        </>
      )}
    </DropdownMenuContent>
  )
}

export { SelectMenuContent }
export type { SelectMenuOption }

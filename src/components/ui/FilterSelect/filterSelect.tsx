'use client'

import ChevronDownIcon from '@/assets/icons/chevronDown.svg'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/DropdownMenu/dropdownMenu'
import {
  SelectMenuContent,
  type SelectMenuOption,
} from '@/components/ui/SelectMenu/selectMenuContent'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import type { ReactNode } from 'react'

type FilterSelectProps<TValue extends string> = {
  // 화면에 보이지 않는 트리거 이름(예: "정렬")
  label: string
  icon?: ReactNode
  options: readonly SelectMenuOption<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
}

function FilterSelect<TValue extends string>({
  label,
  icon,
  options,
  value,
  onValueChange,
}: FilterSelectProps<TValue>) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="filter-select"
          data-pointer-focus={isPointerFocus ? '' : undefined}
          onPointerDown={markPointerFocus}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-s text-label1 font-medium whitespace-nowrap text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid data-pointer-focus:focus-visible:outline-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          {icon}
          <span className="sr-only">{label} </span>
          {selectedLabel}
          <ChevronDownIcon aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <SelectMenuContent options={options} value={value} onValueChange={onValueChange} />
    </DropdownMenu>
  )
}

export { FilterSelect }

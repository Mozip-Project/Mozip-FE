'use client'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { SelectMenuTrigger } from './selectMenuTrigger'
import type { ReactNode } from 'react'

type MultiSelectMenuOption<TValue extends string> = {
  value: TValue
  label: string
  count?: number
}

type MultiSelectMenuProps<TValue extends string> = {
  label: string
  options: readonly MultiSelectMenuOption<TValue>[]
  values: readonly TValue[]
  onValuesChange: (values: TValue[]) => void
  totalCount?: number
}

// TODO: 선택 없음·여러 개 선택 시 트리거 문구 디자이너 확인 (임시로 라벨만, "첫 항목 외 N")
function getTriggerText(label: string, selectedLabels: readonly string[], isAllSelected: boolean) {
  if (isAllSelected) {
    return `${label} 전체`
  }

  const [firstLabel, ...restLabels] = selectedLabels

  if (firstLabel === undefined) {
    return label
  }

  if (restLabels.length === 0) {
    return firstLabel
  }

  return `${firstLabel} 외 ${restLabels.length}`
}

function MultiSelectMenu<TValue extends string>({
  label,
  options,
  values,
  onValuesChange,
  totalCount,
}: MultiSelectMenuProps<TValue>) {
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label)
  const isAllSelected = options.length > 0 && selectedLabels.length === options.length

  function handleAllCheckedChange(isChecked: boolean) {
    onValuesChange(isChecked ? options.map((option) => option.value) : [])
  }

  function handleOptionCheckedChange(optionValue: TValue, isChecked: boolean) {
    const nextValues = isChecked
      ? [...values, optionValue]
      : values.filter((value) => value !== optionValue)

    onValuesChange(nextValues)
  }

  return (
    <DropdownMenu>
      <SelectMenuTrigger label={label}>
        {getTriggerText(label, selectedLabels, isAllSelected)}
      </SelectMenuTrigger>

      <DropdownMenuContent className="p-padding-xs">
        <MultiSelectOption
          checked={isAllSelected}
          onCheckedChange={handleAllCheckedChange}
          count={totalCount}
        >
          전체
        </MultiSelectOption>

        <DropdownMenuSeparator className="my-gap-xs" />

        {options.map((option) => (
          <MultiSelectOption
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={(isChecked) => handleOptionCheckedChange(option.value, isChecked)}
            count={option.count}
          >
            {option.label}
          </MultiSelectOption>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type MultiSelectOptionProps = {
  checked: boolean
  onCheckedChange: (isChecked: boolean) => void
  count?: number
  children: ReactNode
}

function MultiSelectOption({ count, children, ...props }: MultiSelectOptionProps) {
  return (
    <DropdownMenuCheckboxItem
      // 여러 항목을 이어서 고를 수 있게 선택 후에도 메뉴 유지
      onSelect={(event) => event.preventDefault()}
      className="data-[state=checked]:font-semibold"
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && (
        <span className="shrink-0 font-medium text-neutral-subtle">{count}</span>
      )}
    </DropdownMenuCheckboxItem>
  )
}

export { MultiSelectMenu }

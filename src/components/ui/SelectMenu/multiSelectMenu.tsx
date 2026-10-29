'use client'

import { useId } from 'react'
import AlertCircleIcon from '@/assets/icons/alertCircle.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { MultiSelectOption } from './multiSelectOption'
import { SelectMenuTrigger } from './selectMenuTrigger'

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
  groupLabel?: string
  errorMessage?: string
}

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

  return `${firstLabel} 외 ${restLabels.length}개`
}

function MultiSelectMenu<TValue extends string>({
  label,
  options,
  values,
  onValuesChange,
  totalCount,
  groupLabel,
  errorMessage,
}: MultiSelectMenuProps<TValue>) {
  const groupLabelId = useId()
  const errorMessageId = useId()
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
      {/* 메뉴는 열릴 때만 그려져 오류 알림은 메뉴 밖 상시 영역에서 처리 */}
      <span role="status" className="sr-only">
        {errorMessage}
      </span>

      <DropdownMenuContent
        align="end"
        aria-describedby={errorMessage ? errorMessageId : undefined}
        className="flex w-60 flex-col gap-gap-xxs rounded-m border-neutral-muted p-padding-xs"
      >
        {groupLabel && <DropdownMenuLabel id={groupLabelId}>{groupLabel}</DropdownMenuLabel>}

        <DropdownMenuGroup
          aria-labelledby={groupLabel ? groupLabelId : undefined}
          className="flex flex-col gap-gap-xxs"
        >
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
        </DropdownMenuGroup>

        {errorMessage && (
          <p
            id={errorMessageId}
            className="flex items-center gap-gap-xs px-padding-s py-padding-xs text-caption1 font-medium text-critical"
          >
            <AlertCircleIcon aria-hidden className="size-4 shrink-0" />
            {errorMessage}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MultiSelectMenu }

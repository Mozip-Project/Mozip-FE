'use client'

import { useId, type ReactNode } from 'react'
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { cn } from '@/lib/utils'

type SelectMenuOption<TValue extends string> = {
  value: TValue
  label: string
}

type SelectMenuContentProps<TValue extends string> = {
  options: readonly SelectMenuOption<TValue>[]
  value: TValue | null
  onValueChange: (value: TValue) => void
  groupLabel?: string
  actions?: ReactNode
  sideOffset?: number
  className?: string
}

const CHECKED_ITEM_SELECTOR = '[role="menuitemradio"][data-state="checked"]'

// 긴 목록에서 열 때 선택 항목이 보이도록 스크롤
function scrollToCheckedItem(content: HTMLDivElement | null) {
  const checkedItem = content?.querySelector<HTMLElement>(CHECKED_ITEM_SELECTOR)

  if (!content || !checkedItem) {
    return
  }
  const itemTop =
    checkedItem.getBoundingClientRect().top -
    content.getBoundingClientRect().top +
    content.scrollTop
  content.scrollTop = itemTop - (content.clientHeight - checkedItem.offsetHeight) / 2
}

// SelectMenu, FilterSelect가 트리거만 다르고 같은 패널을 공유
function SelectMenuContent<TValue extends string>({
  options,
  value,
  onValueChange,
  groupLabel,
  actions,
  sideOffset,
  className,
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
      ref={scrollToCheckedItem}
      align="end"
      sideOffset={sideOffset}
      className={cn(
        'flex w-50 flex-col gap-gap-xxs rounded-m border-neutral-muted p-padding-xs',
        className,
      )}
    >
      {groupLabel && <DropdownMenuLabel id={groupLabelId}>{groupLabel}</DropdownMenuLabel>}

      <DropdownMenuRadioGroup
        aria-labelledby={groupLabel ? groupLabelId : undefined}
        className="flex flex-col gap-gap-xxs"
        value={value ?? ''}
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

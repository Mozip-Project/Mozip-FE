'use client'

import Link from 'next/link'
import { useId, type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import { SelectMenuTrigger } from './selectMenuTrigger'
import type { Route } from 'next'

type SelectMenuOption<TValue extends string> = {
  value: TValue
  label: string
}

type SelectMenuProps<TValue extends string> = {
  label: string
  options: readonly SelectMenuOption<TValue>[]
  value: TValue
  onValueChange: (value: TValue) => void
  groupLabel?: string
  actions?: ReactNode
}

function SelectMenu<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  groupLabel,
  actions,
}: SelectMenuProps<TValue>) {
  const groupLabelId = useId()
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  function handleValueChange(nextValue: string) {
    const nextOption = options.find((option) => option.value === nextValue)

    if (nextOption) {
      onValueChange(nextOption.value)
    }
  }

  return (
    <DropdownMenu>
      <SelectMenuTrigger label={label}>{selectedLabel}</SelectMenuTrigger>

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
    </DropdownMenu>
  )
}

type SelectMenuActionProps = {
  href: Route
  children: ReactNode
}

// TODO: brand 글자색 대비 디자이너 확인
function SelectMenuAction({ href, children }: SelectMenuActionProps) {
  return (
    <DropdownMenuItem asChild className="text-brand [&_svg]:text-neutral">
      <Link href={href}>{children}</Link>
    </DropdownMenuItem>
  )
}

export { SelectMenu, SelectMenuAction }

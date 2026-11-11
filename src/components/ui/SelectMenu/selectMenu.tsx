'use client'

import Link from 'next/link'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import { SelectMenuContent, type SelectMenuOption } from './selectMenuContent'
import { SelectMenuTrigger } from './selectMenuTrigger'
import type { Route } from 'next'
import type { ReactNode } from 'react'

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
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  return (
    <DropdownMenu>
      <SelectMenuTrigger label={label}>{selectedLabel}</SelectMenuTrigger>
      <SelectMenuContent
        options={options}
        value={value}
        onValueChange={onValueChange}
        groupLabel={groupLabel}
        actions={actions}
      />
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

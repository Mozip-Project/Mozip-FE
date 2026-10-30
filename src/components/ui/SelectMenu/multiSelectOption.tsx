'use client'

import { DropdownMenuCheckboxItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import type { ReactNode } from 'react'

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

export { MultiSelectOption }

'use client'

import MenuIcon from '@/assets/icons/menu.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import type { ComponentProps, ReactNode } from 'react'

const ACTION_MENU_SIDE_OFFSET_PX = 8

type ActionMenuProps = Pick<
  ComponentProps<typeof DropdownMenuContent>,
  'sideOffset' | 'onCloseAutoFocus'
> & {
  // 목록마다 반복되어 대상을 포함한 이름 사용
  label: string
  children: ReactNode
}

// 목록 항목 오른쪽 ⋯ 버튼과 항목 동작 메뉴
function ActionMenu({
  label,
  sideOffset = ACTION_MENU_SIDE_OFFSET_PX,
  onCloseAutoFocus,
  children,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        <MenuIcon aria-hidden className="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={sideOffset}
        onCloseAutoFocus={onCloseAutoFocus}
        className="w-50 rounded-m border-neutral-muted bg-layer-default p-padding-xs"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ActionMenu }

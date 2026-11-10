'use client'

import MenuIcon from '@/assets/icons/menu.svg'
import RefreshIcon from '@/assets/icons/refresh.svg'
import UserMinusIcon from '@/assets/icons/userMinus.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu/dropdownMenu'
import type { MemberRole } from '@/features/organization/types'
import type { FC, SVGProps } from 'react'

const MENU_SIDE_OFFSET_PX = 8

const ROLE_ACTION = {
  owner: { label: '대표자 변경', icon: RefreshIcon },
  member: { label: '운영진 내보내기', icon: UserMinusIcon },
} satisfies Record<MemberRole, { label: string; icon: FC<SVGProps<SVGSVGElement>> }>

type MemberActionMenuProps = {
  memberName: string
  role: MemberRole
}

function MemberActionMenu({ memberName, role }: MemberActionMenuProps) {
  const { label, icon: ActionIcon } = ROLE_ACTION[role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${memberName} 관리 메뉴`}
        className="flex size-6 cursor-pointer items-center justify-center rounded-s text-neutral-subtle outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
      >
        <MenuIcon aria-hidden className="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={MENU_SIDE_OFFSET_PX}
        className="w-50 rounded-m border-neutral-muted bg-layer-default p-padding-xs"
      >
        {/* TODO: 대표자 변경·운영진 내보내기 다음 단계 연결 */}
        <DropdownMenuItem>
          <ActionIcon aria-hidden />
          {label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MemberActionMenu }

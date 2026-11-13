'use client'

import RefreshIcon from '@/assets/icons/refresh.svg'
import UserMinusIcon from '@/assets/icons/userMinus.svg'
import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import type { MemberRole } from '@/features/organization/types'
import type { FC, SVGProps } from 'react'

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
    <ActionMenu label={`${memberName} 관리 메뉴`}>
      {/* TODO: 대표자 변경·운영진 내보내기 다음 단계 연결 */}
      <DropdownMenuItem>
        <ActionIcon aria-hidden />
        {label}
      </DropdownMenuItem>
    </ActionMenu>
  )
}

export { MemberActionMenu }

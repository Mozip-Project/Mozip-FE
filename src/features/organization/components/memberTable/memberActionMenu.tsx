'use client'

import RefreshIcon from '@/assets/icons/refresh.svg'
import UserMinusIcon from '@/assets/icons/userMinus.svg'
import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import { COMING_SOON_TOAST } from '@/features/organization/constants'
import type { MemberRole } from '@/features/organization/types'
import { useToast } from '@/providers/toastProvider'
import type { FC, SVGProps } from 'react'

const ROLE_ACTION = {
  owner: { label: '대표자 변경', icon: RefreshIcon, isComingSoon: true },
  member: { label: '운영진 내보내기', icon: UserMinusIcon, isComingSoon: false },
} satisfies Record<
  MemberRole,
  { label: string; icon: FC<SVGProps<SVGSVGElement>>; isComingSoon: boolean }
>

type MemberActionMenuProps = {
  memberName: string
  role: MemberRole
}

function MemberActionMenu({ memberName, role }: MemberActionMenuProps) {
  const { showToast } = useToast()
  const { label, icon: ActionIcon, isComingSoon } = ROLE_ACTION[role]

  function handleSelect() {
    if (isComingSoon) {
      showToast(COMING_SOON_TOAST)
    }
  }

  return (
    <ActionMenu label={`${memberName} 관리 메뉴`}>
      {/* TODO: 대표자 변경은 requestRepresentativeTransfer, 운영진 내보내기는 removeMember 연결 */}
      <DropdownMenuItem onSelect={handleSelect}>
        <ActionIcon aria-hidden />
        {label}
      </DropdownMenuItem>
    </ActionMenu>
  )
}

export { MemberActionMenu }

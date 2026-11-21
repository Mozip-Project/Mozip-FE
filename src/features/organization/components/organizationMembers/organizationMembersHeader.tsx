'use client'

import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { COMING_SOON_TOAST } from '@/features/organization/constants'
import { useToast } from '@/providers/toastProvider'

type OrganizationMembersHeaderProps = {
  // undefined는 목록을 불러오는 중
  memberCount?: number
}

function OrganizationMembersHeader({ memberCount }: OrganizationMembersHeaderProps) {
  const { showToast } = useToast()
  const title = memberCount === undefined ? '운영진' : `운영진 ${memberCount}명`

  return (
    <PageHeader
      title={title}
      // TODO: 운영진 초대 화면 준비 후 inviteMember·createInviteLink 연결
      actions={
        <Button size="m" onClick={() => showToast(COMING_SOON_TOAST)}>
          운영진 초대하기
        </Button>
      }
    />
  )
}

export { OrganizationMembersHeader }

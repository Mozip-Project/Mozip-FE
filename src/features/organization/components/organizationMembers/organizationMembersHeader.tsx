import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'

type OrganizationMembersHeaderProps = {
  // undefined는 목록을 불러오는 중
  memberCount?: number
}

function OrganizationMembersHeader({ memberCount }: OrganizationMembersHeaderProps) {
  const title = memberCount === undefined ? '운영진' : `운영진 ${memberCount}명`

  return (
    <PageHeader
      title={title}
      // TODO: 운영진 초대 기능 연결
      actions={<Button size="m">운영진 초대하기</Button>}
    />
  )
}

export { OrganizationMembersHeader }

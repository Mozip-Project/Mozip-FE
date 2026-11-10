import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { MemberTable } from '@/features/organization/components/memberTable/memberTable'
import { ORGANIZATION_MEMBERS_SAMPLE } from '@/features/organization/mocks/organizationMembersSample'

export default function OrganizationMembersPage() {
  const members = ORGANIZATION_MEMBERS_SAMPLE

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title={`운영진 ${members.length}명`}
        // TODO: 운영진 초대 기능 연결
        actions={<Button size="m">운영진 초대하기</Button>}
      />
      <MemberTable members={members} />
    </div>
  )
}

import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getOrganizationPlan, getOrganizationProfile } from '@/features/organization/api/organizer'
import { OrganizationPlanBanner } from '@/features/organization/components/organizationPlan/organizationPlanBanner'
import { getUpRemainingCount } from '@/features/posting/api/organizer'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import { PostingManageBoard } from '@/features/posting/components/postingManage/postingManageBoard'

export default async function ManageHomePage() {
  const [profile, plan, upRemainingCount] = await Promise.all([
    getOrganizationProfile(),
    getOrganizationPlan(),
    getUpRemainingCount(),
  ])

  return (
    <main className="flex flex-col gap-12">
      <div className="flex flex-col gap-gap-xl">
        <PageHeader
          title={profile.name}
          actions={
            <PostingStartDialog>
              <Button size="m">새 공고 만들기</Button>
            </PostingStartDialog>
          }
        />
        <OrganizationPlanBanner plan={plan} initialUpRemainingCount={upRemainingCount} />
      </div>
      {/* 삭제·UP 결과를 바로 반영하도록 목록은 클라이언트에서 조회 */}
      <PostingManageBoard />
    </main>
  )
}

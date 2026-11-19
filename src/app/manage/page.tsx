import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { getOrganizationPlan, getOrganizationProfile } from '@/features/organization/api/organizer'
import { OrganizationPlanBanner } from '@/features/organization/components/organizationPlan/organizationPlanBanner'
import { getUpRemainingCount } from '@/features/posting/api/organizer'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import { getOngoingRecruitments } from '@/features/recruitment/api/organizer'
import { OngoingRecruitmentSection } from '@/features/recruitment/components/ongoingRecruitment/ongoingRecruitmentSection'

export default async function ManageHomePage() {
  const [profile, plan, upRemainingCount, recruitments] = await Promise.all([
    getOrganizationProfile(),
    getOrganizationPlan(),
    getUpRemainingCount(),
    getOngoingRecruitments(),
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
        <OrganizationPlanBanner plan={plan} upRemainingCount={upRemainingCount} />
      </div>
      <OngoingRecruitmentSection recruitments={recruitments} />
    </main>
  )
}

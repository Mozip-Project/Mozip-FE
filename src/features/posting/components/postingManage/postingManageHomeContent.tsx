'use client'

import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import {
  useManagedPostingSummaryQuery,
  useOrganizationPostingsQuery,
} from '@/features/posting/api/organizer/queries'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import { PostingManageBoard } from './postingManageBoard'
import { PostingManageHomeSkeleton } from './postingManageHomeSkeleton'

type PostingManageHomeContentProps = {
  savedOrganizationId: string | undefined
}

function PostingManageHomeContent({ savedOrganizationId }: PostingManageHomeContentProps) {
  const { meQuery, organizations, currentOrganizationId } =
    useCurrentOrganization(savedOrganizationId)
  // 단체명은 헤더 단체 선택과 같은 내 정보(me) 값 사용
  const organization = organizations.find(({ id }) => id === currentOrganizationId)
  // 보드와 같은 query라 요청은 한 번, 탭 숫자와 첫 탭 목록까지 받은 뒤 화면을 한 번에 표시
  const summaryQuery = useManagedPostingSummaryQuery(organization?.id ?? null)
  const firstTabQuery = useOrganizationPostingsQuery(
    organization?.id ?? null,
    MANAGED_POSTING_TAB_STATUSES.published,
  )

  if (meQuery.isError) {
    return (
      <OrganizationLoadError
        message="단체 정보를 불러오지 못했어요"
        onRetry={() => void meQuery.refetch()}
      />
    )
  }
  // 소속 단체가 없으면 헤더(OrganizationSwitcher)가 다른 화면으로 이동
  if (meQuery.isSuccess && !organization) {
    return null
  }
  // 첫 응답 전까지만 대기, isPending은 실패 후 재요청 때 다시 true라 보드가 내려갔다 올라오며 요청 반복
  if (!organization || !summaryQuery.isFetched || !firstTabQuery.isFetched) {
    return <PostingManageHomeSkeleton />
  }

  return (
    <>
      <PageHeader
        title={organization.name}
        actions={
          <PostingStartDialog>
            <Button size="m">새 공고 만들기</Button>
          </PostingStartDialog>
        }
      />
      {/* TODO: 전시회 뒤 이용권 배너(OrganizationPlanBanner) 다시 표시 */}
      <PostingManageBoard organizationId={organization.id} />
    </>
  )
}

export { PostingManageHomeContent }

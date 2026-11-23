'use client'

import { Button } from '@/components/ui/Button/button'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
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

  if (organization) {
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
  if (meQuery.isError) {
    return (
      <OrganizationLoadError
        message="단체 정보를 불러오지 못했어요"
        onRetry={() => void meQuery.refetch()}
      />
    )
  }
  // 소속 단체가 없으면 헤더(OrganizationSwitcher)가 다른 화면으로 이동
  if (meQuery.isSuccess) {
    return null
  }
  return <PostingManageHomeSkeleton />
}

export { PostingManageHomeContent }

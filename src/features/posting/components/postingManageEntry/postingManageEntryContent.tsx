'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import MegaphoneIcon from '@/assets/icons/megaphone.svg'
import PlusIcon from '@/assets/icons/plus.svg'
import { Button } from '@/components/ui/Button/button'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { useOrganizationPostingsQuery } from '@/features/posting/api/organizer/queries'
import { PostingStartDialog } from '@/features/posting/components/postingCreate/postingStartDialog'
import { PostingManageDetailSkeleton } from '@/features/posting/components/postingManageDetail/postingManageDetailSkeleton'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import { getPostingManageDetailPath } from '@/features/recruitment/utils/recruitmentRoutes'

type PostingManageEntryContentProps = {
  savedOrganizationId: string | undefined
}

// 첫 진행 중 공고 상세로 이동, 없으면 빈 상태
function PostingManageEntryContent({ savedOrganizationId }: PostingManageEntryContentProps) {
  const router = useRouter()
  const { meQuery, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const publishedQuery = useOrganizationPostingsQuery(
    currentOrganizationId,
    MANAGED_POSTING_TAB_STATUSES.published,
  )
  const firstPostingId = publishedQuery.data?.[0]?.id

  // 서버 요청은 로그인 쿠키가 없어 브라우저에서 이동
  useEffect(() => {
    if (firstPostingId) {
      router.replace(getPostingManageDetailPath(firstPostingId))
    }
  }, [firstPostingId, router])

  if (meQuery.isError) {
    return (
      <OrganizationLoadError
        message="단체 정보를 불러오지 못했어요"
        onRetry={() => void meQuery.refetch()}
      />
    )
  }
  if (publishedQuery.isError) {
    return (
      <OrganizationLoadError
        message="모집 목록을 불러오지 못했어요"
        onRetry={() => void publishedQuery.refetch()}
      />
    )
  }
  if (!publishedQuery.data || firstPostingId) {
    return <PostingManageDetailSkeleton />
  }

  return (
    <>
      <h1 className="sr-only">모집 관리</h1>
      <EmptyState
        className="border-0 py-60"
        icon={<MegaphoneIcon className="size-7" />}
        title="아직 관리할 모집이 없어요"
        description="새 모집을 만들면 공고 작성부터 지원자 관리, 서류·면접 평가까지 이곳에서 진행할 수 있어요."
        actions={
          <PostingStartDialog>
            <Button size="m">
              <PlusIcon aria-hidden />새 모집 만들기
            </Button>
          </PostingStartDialog>
        }
      />
    </>
  )
}

export { PostingManageEntryContent }

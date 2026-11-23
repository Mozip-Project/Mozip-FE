'use client'

import { useState } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { Button } from '@/components/ui/Button/button'
import { Callout } from '@/components/ui/Callout/callout'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { useManagedPostingQuery } from '@/features/posting/api/organizer/queries'
import { getPostingRecruitmentPhase, toPostingDetail } from '@/features/posting/utils/postingDetail'
import { ApiError } from '@/lib/apiError'
import { PostingDetailCard } from './postingDetailCard'
import { PostingManageDetailSkeleton } from './postingManageDetailSkeleton'
import { PostingNoticeDialog } from './postingNoticeDialog'
import { PostingPreviewCard } from './postingPreviewCard'

const POSTING_NOT_FOUND_CODE = 'POSTING_404'

type PostingManageDetailContentProps = {
  postingId: string
  savedOrganizationId: string | undefined
}

function PostingManageDetailContent({
  postingId,
  savedOrganizationId,
}: PostingManageDetailContentProps) {
  const { meQuery, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const postingQuery = useManagedPostingQuery(postingId)
  // D-day 기준 시각, 다시 그릴 때마다 바뀌지 않도록 처음 한 번만
  const [now] = useState(() => new Date())

  if (meQuery.isError) {
    return (
      <OrganizationLoadError
        message="단체 정보를 불러오지 못했어요"
        onRetry={() => void meQuery.refetch()}
      />
    )
  }
  // 소속 단체가 없으면 헤더(OrganizationSwitcher)가 다른 화면으로 이동
  if (meQuery.isSuccess && !currentOrganizationId) {
    return null
  }
  if (postingQuery.isError && !postingQuery.data) {
    const isNotFound =
      postingQuery.error instanceof ApiError && postingQuery.error.code === POSTING_NOT_FOUND_CODE
    if (isNotFound) {
      return <PostingNotFound />
    }
    return (
      <OrganizationLoadError
        message="공고를 불러오지 못했어요"
        onRetry={() => void postingQuery.refetch()}
      />
    )
  }
  if (!currentOrganizationId || !postingQuery.data) {
    return <PostingManageDetailSkeleton />
  }

  const posting = postingQuery.data
  // 공개 조회라 다른 단체 공고도 응답, 현재 단체 공고만 관리
  if (posting.organization.id !== currentOrganizationId) {
    return <PostingNotFound />
  }

  const detail = toPostingDetail(posting)
  const phase = getPostingRecruitmentPhase(
    detail.recruitmentStartsAt,
    detail.recruitmentEndsAt,
    now,
  )

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title={detail.title}
        actions={
          <div className="flex items-center gap-gap-m">
            {/* TODO: 공고 수정 경로 확정 후 연결 */}
            <Button variant="secondary" size="m">
              공고 수정하기
            </Button>
            <PostingNoticeDialog
              postingId={posting.id}
              postingTitle={detail.title}
              organizationName={detail.organization.name}
              applicantCount={posting.applicationCount}
            />
          </div>
        }
      />
      <div className="flex flex-col gap-gap-m">
        <Callout
          tone="informative"
          title="모집이 연장되면 공고 일정을 직접 수정하고 지원자에게 공지로 알려주세요"
        />
        <div className="flex flex-col gap-gap-l desktop:flex-row desktop:items-start">
          <PostingDetailCard detail={detail} phase={phase} />
          <PostingPreviewCard detail={detail} phase={phase} />
        </div>
      </div>
    </div>
  )
}

// TODO: 없는 공고·다른 단체 공고 안내 디자인 확인 필요
function PostingNotFound() {
  return (
    <div className="flex flex-col gap-gap-xl">
      <h1 className="sr-only">공고 관리</h1>
      <EmptyState icon={<FileTextIcon className="size-7" />} title="공고를 찾을 수 없어요" />
    </div>
  )
}

export { PostingManageDetailContent }

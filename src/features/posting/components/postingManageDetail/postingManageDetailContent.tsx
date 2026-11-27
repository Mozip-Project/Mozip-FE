'use client'

import ArrowRightIcon from '@/assets/icons/arrowRight.svg'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { Button } from '@/components/ui/Button/button'
import { Callout } from '@/components/ui/Callout/callout'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { COMING_SOON_TOAST } from '@/features/organization/constants'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { useManagedPostingQuery } from '@/features/posting/api/organizer/queries'
import { ServerPostingUnsupportedButton } from '@/features/posting/components/demoServerPosting/serverPostingUnsupportedButton'
import { isServerPosting } from '@/features/posting/utils/demoServerPosting'
import { getPostingRecruitmentPhase, toPostingDetail } from '@/features/posting/utils/postingDetail'
import { ApiError } from '@/lib/apiError'
import { useToast } from '@/providers/toastProvider'
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
  const { showToast } = useToast()

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
  // D-day는 마지막 조회 시각 기준, 다시 조회(창 복귀 등)할 때마다 갱신
  const phase = getPostingRecruitmentPhase(
    detail.recruitmentStartsAt,
    detail.recruitmentEndsAt,
    new Date(postingQuery.dataUpdatedAt),
  )

  return (
    <div className="flex flex-col gap-gap-xl">
      <PageHeader
        title={detail.title}
        actions={
          <div className="flex items-center gap-gap-m">
            {/* TODO: 공고 작성 연결(savePostingDraft) 후 작성 단계 화면으로 이동, 그 전까지 준비 중 안내 */}
            <Button variant="secondary" size="m" onClick={() => showToast(COMING_SOON_TOAST)}>
              공고 수정하기
            </Button>
            {/* 시연 모드의 실서버 공고는 서버에 공지가 없어 안내만 (전시회 후 삭제) */}
            {isServerPosting(posting.id) ? (
              <ServerPostingUnsupportedButton size="m">
                공지 보내기
                <ArrowRightIcon aria-hidden />
              </ServerPostingUnsupportedButton>
            ) : (
              <PostingNoticeDialog
                postingId={posting.id}
                postingTitle={detail.title}
                organizationName={detail.organization.name}
                applicantCount={posting.applicationCount}
              />
            )}
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

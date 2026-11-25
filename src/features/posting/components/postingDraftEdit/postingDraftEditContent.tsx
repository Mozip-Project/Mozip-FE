'use client'

import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { PageHeader } from '@/components/ui/PageHeader/pageHeader'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { usePostingDraftQuery } from '@/features/posting/api/organizer/queries'
import {
  getSavedPositionIds,
  toPostingCreateValues,
} from '@/features/posting/utils/postingDraftValues'
import { ApiError } from '@/lib/apiError'
import { PostingCreateForm } from '../postingCreate/postingCreateForm'

const POSTING_NOT_FOUND_CODE = 'POSTING_404'

type PostingDraftEditContentProps = {
  postingId: string
  savedOrganizationId: string | undefined
}

// 저장된 작성 중 공고를 불러와 1단계부터 이어서 작성
function PostingDraftEditContent({ postingId, savedOrganizationId }: PostingDraftEditContentProps) {
  const { meQuery, currentOrganizationId } = useCurrentOrganization(savedOrganizationId)
  const draftQuery = usePostingDraftQuery(postingId)

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
  if (draftQuery.isError && !draftQuery.data) {
    const isNotFound =
      draftQuery.error instanceof ApiError && draftQuery.error.code === POSTING_NOT_FOUND_CODE
    if (isNotFound) {
      return <PostingDraftUnavailable title="공고를 찾을 수 없어요" />
    }
    return (
      <OrganizationLoadError
        message="공고를 불러오지 못했어요"
        onRetry={() => void draftQuery.refetch()}
      />
    )
  }
  if (!currentOrganizationId || !draftQuery.data) {
    return <PageHeader title="공고 작성" />
  }

  const posting = draftQuery.data
  if (posting.organization.id !== currentOrganizationId) {
    return <PostingDraftUnavailable title="공고를 찾을 수 없어요" />
  }
  // 서버는 작성 중 공고만 저장 가능
  if (posting.status !== 'DRAFT') {
    return <PostingDraftUnavailable title="이미 게시된 공고예요" />
  }

  return (
    <PostingCreateForm
      hasInterview={posting.hasInterview}
      savedOrganizationId={savedOrganizationId}
      defaultValues={toPostingCreateValues(posting)}
      savedDraft={{
        id: posting.id,
        positionIds: getSavedPositionIds(posting),
        updatedAt: posting.updatedAt,
      }}
    />
  )
}

// TODO: 없는 공고·게시된 공고 안내 디자인 확인 필요
function PostingDraftUnavailable({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-gap-xl">
      <h1 className="sr-only">공고 작성</h1>
      <EmptyState icon={<FileTextIcon className="size-7" />} title={title} />
    </div>
  )
}

export { PostingDraftEditContent }

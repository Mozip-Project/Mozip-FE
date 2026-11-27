'use client'

import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { useCurrentOrganization } from '@/features/organization/hooks/useCurrentOrganization'
import { useOrganizationPostingsQuery } from '@/features/posting/api/organizer/queries'
import { MANAGED_POSTING_TAB_STATUSES } from '@/features/posting/utils/managedPosting'
import {
  getPostingEditPath,
  parsePostingEditPath,
} from '@/features/posting/utils/postingCreateRoute'
import { getRecruitmentDday } from '@/features/posting/utils/recruitmentDday'
import { useRecruitmentPostingQuery } from '@/features/recruitment/api/organizer/queries'
import {
  getDocumentReviewPath,
  getInterviewTimetablePath,
  getPostingManageDetailPath,
  POSTING_CREATE_PATH,
} from '@/features/recruitment/utils/recruitmentRoutes'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { getActivePathMatch } from '@/utils/activePath'
import { EmptyRecruitmentNavView, RecruitmentNavView, type LnbSection } from './recruitmentNavView'
import { RecruitPickerDialog } from './recruitPickerDialog'
import { RecruitSwitcher } from './recruitSwitcher'

// 공고 작성에서 제목을 처음 저장하기 전
const UNSELECTED_RECRUIT_NAME = '진행 중인 모집이 없어요'

function RecruitmentNavPlaceholder() {
  return (
    <RecruitmentNavView
      postingStatus={null}
      hasInterview={false}
      currentSection={null}
      switcher={<RecruitSwitcher name={null} disabled />}
    />
  )
}

type RecruitmentNavProps = {
  savedOrganizationId: string | undefined
}

// 동적 경로는 prerender 시 공고 ID를 몰라 조회 전 메뉴를 먼저 렌더링
function RecruitmentNav({ savedOrganizationId }: RecruitmentNavProps) {
  return (
    <Suspense fallback={<RecruitmentNavPlaceholder />}>
      <RecruitmentNavByPosting savedOrganizationId={savedOrganizationId} />
    </Suspense>
  )
}

function RecruitmentNavByPosting({ savedOrganizationId }: RecruitmentNavProps) {
  const params = useParams<{ postingId?: string }>()
  const pathname = usePathname()
  const postingId = params.postingId ?? parsePostingEditPath(pathname)
  const isHydrated = useIsHydrated()
  const { currentOrganizationId } = useCurrentOrganization(savedOrganizationId)

  // 공유 layout은 서버에서 공고 ID가 있는 화면 기준으로 그려져 hydration 후 실제 경로 반영
  if (!isHydrated) {
    return <RecruitmentNavPlaceholder />
  }
  if (!postingId && pathname !== POSTING_CREATE_PATH) {
    return <PostingListEntryNav organizationId={currentOrganizationId} />
  }
  if (!postingId) {
    return (
      <RecruitmentNavView
        postingStatus={null}
        hasInterview={false}
        currentSection="posting"
        isCreatingPosting
        switcher={
          <RecruitPickerDialog organizationId={currentOrganizationId}>
            <RecruitSwitcher name={UNSELECTED_RECRUIT_NAME} />
          </RecruitPickerDialog>
        }
      />
    )
  }
  return (
    <RecruitmentNavWithPosting
      postingId={postingId}
      organizationId={currentOrganizationId}
      pathname={pathname}
    />
  )
}

// 첫 진행 중 공고로 이동하기 전까지 스켈레톤, 공고가 없으면 모집 없음 메뉴
function PostingListEntryNav({ organizationId }: { organizationId: string | null }) {
  const { data: publishedPostings } = useOrganizationPostingsQuery(
    organizationId,
    MANAGED_POSTING_TAB_STATUSES.published,
  )

  if (publishedPostings?.length === 0) {
    return <EmptyRecruitmentNavView />
  }
  return <RecruitmentNavPlaceholder />
}

type RecruitmentNavWithPostingProps = {
  postingId: string
  organizationId: string | null
  pathname: string
}

function getCurrentSection(postingId: string, pathname: string): LnbSection | null {
  const editPath = getPostingEditPath(postingId)

  if (pathname === getPostingManageDetailPath(postingId) || pathname === editPath) {
    return 'posting'
  }
  if (getActivePathMatch(pathname, getDocumentReviewPath(postingId))) {
    return 'documents'
  }
  if (getActivePathMatch(pathname, getInterviewTimetablePath(postingId))) {
    return 'interviews'
  }
  return null
}

// 부모가 hydration 뒤에만 그려 서버 HTML과 어긋나지 않음
function RecruitmentNavWithPosting({
  postingId,
  organizationId,
  pathname,
}: RecruitmentNavWithPostingProps) {
  const { data: posting } = useRecruitmentPostingQuery(postingId)

  return (
    <RecruitmentNavView
      postingStatus={posting?.status ?? null}
      hasInterview={posting?.hasInterview ?? false}
      currentSection={getCurrentSection(postingId, pathname)}
      isCreatingPosting={pathname === getPostingEditPath(postingId)}
      switcher={
        <RecruitPickerDialog organizationId={organizationId} currentPostingId={postingId}>
          <RecruitSwitcher
            name={posting?.title ?? null}
            ddayLabel={posting ? getRecruitmentDday(posting, new Date()) : null}
          />
        </RecruitPickerDialog>
      }
    />
  )
}

export { RecruitmentNav, RecruitmentNavPlaceholder }

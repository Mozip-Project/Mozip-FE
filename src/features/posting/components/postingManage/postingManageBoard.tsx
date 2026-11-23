'use client'

import { useState } from 'react'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { OrganizationLoadError } from '@/features/organization/components/organizationLoadError/organizationLoadError'
import {
  useManagedPostingSummaryQuery,
  useOrganizationPostingsQuery,
} from '@/features/posting/api/organizer/queries'
import {
  MANAGED_POSTING_STATUS_LABEL,
  MANAGED_POSTING_STATUSES,
  type ManagedPostingStatus,
} from '@/features/posting/types'
import {
  MANAGED_POSTING_TAB_STATUSES,
  toManagedPosting,
} from '@/features/posting/utils/managedPosting'
import type { ManagedPostingSummaryQuery } from '@/gql/graphql'
import { ManagedPostingPanel } from './managedPostingPanel'

type PostingCounts = ManagedPostingSummaryQuery['organization']['postingCounts']

const TAB_COUNT_FIELD = {
  published: 'published',
  draft: 'draft',
  closed: 'ended',
} satisfies Record<ManagedPostingStatus, keyof PostingCounts>

type PostingManageBoardProps = {
  organizationId: string
}

// TODO: 목록 로딩 디자인 확정 후 추가
function PostingManageBoard({ organizationId }: PostingManageBoardProps) {
  const [status, setStatus] = useState<ManagedPostingStatus>('published')
  const summaryQuery = useManagedPostingSummaryQuery(organizationId)
  const postingsQuery = useOrganizationPostingsQuery(
    organizationId,
    MANAGED_POSTING_TAB_STATUSES[status],
  )
  // undefined는 조회 중, 탭 숫자를 '-'로 표시
  const postingCounts = summaryQuery.data?.postingCounts
  const tabs = MANAGED_POSTING_STATUSES.map((value) => ({
    value,
    label: MANAGED_POSTING_STATUS_LABEL[value],
    count: postingCounts ? postingCounts[TAB_COUNT_FIELD[value]] : null,
  }))

  function renderPanel() {
    if (postingsQuery.data) {
      return (
        <ManagedPostingPanel
          organizationId={organizationId}
          status={status}
          postings={postingsQuery.data.map(toManagedPosting)}
        />
      )
    }
    if (postingsQuery.isError) {
      return (
        <OrganizationLoadError
          message="공고 목록을 불러오지 못했어요"
          onRetry={() => void postingsQuery.refetch()}
        />
      )
    }
    return null
  }

  return (
    <ListToolBar tabs={tabs} tabsLabel="공고 상태" value={status} onValueChange={setStatus}>
      <div className="pt-gap-xl">{renderPanel()}</div>
    </ListToolBar>
  )
}

export { PostingManageBoard }

'use client'

import { useState } from 'react'
import { ListToolBar } from '@/components/ui/ListToolBar/listToolBar'
import { useManagedPostingsQuery } from '@/features/posting/hooks/useManagedPostings'
import {
  MANAGED_POSTING_STATUS_LABEL,
  MANAGED_POSTING_STATUSES,
  type ManagedPostingStatus,
} from '@/features/posting/types'
import { ManagedPostingPanel } from './managedPostingPanel'

// TODO: 조회 실패 상태는 디자인 확정 후 추가
function PostingManageBoard() {
  const [status, setStatus] = useState<ManagedPostingStatus>('published')
  // undefined는 조회 중, 탭 숫자를 '-'로 표시
  const { data: postings } = useManagedPostingsQuery()
  const tabs = MANAGED_POSTING_STATUSES.map((value) => ({
    value,
    label: MANAGED_POSTING_STATUS_LABEL[value],
    count: postings ? postings.filter((posting) => posting.status === value).length : null,
  }))

  return (
    <ListToolBar tabs={tabs} tabsLabel="공고 상태" value={status} onValueChange={setStatus}>
      {postings && (
        <div className="pt-gap-xl">
          <ManagedPostingPanel
            status={status}
            postings={postings.filter((posting) => posting.status === status)}
          />
        </div>
      )}
    </ListToolBar>
  )
}

export { PostingManageBoard }

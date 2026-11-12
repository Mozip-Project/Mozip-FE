import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import type { ManagedPosting, ManagedPostingStatus } from '@/features/posting/types'
import { ManagedPostingCard } from './managedPostingCard'

const EMPTY_STATE_COPY = {
  published: {
    title: '게시 중인 공고가 없어요',
    description: '공고를 작성하고 지원자를 모집해 보세요',
  },
  draft: {
    title: '작성 중인 공고가 없어요',
    description: '공고를 작성하고 지원자를 모집해 보세요',
  },
  closed: {
    title: '종료된 공고가 없어요',
    description: '모집이 끝나면 종료된 공고를 확인할 수 있어요',
  },
} satisfies Record<ManagedPostingStatus, { title: string; description: string }>

type ManagedPostingPanelProps = {
  status: ManagedPostingStatus
  postings: readonly ManagedPosting[]
}

function ManagedPostingPanel({ status, postings }: ManagedPostingPanelProps) {
  if (postings.length === 0) {
    return (
      <EmptyState
        icon={<FileTextIcon className="size-7" />}
        {...EMPTY_STATE_COPY[status]}
        className="min-h-112.5 justify-center border-0"
      />
    )
  }

  return (
    <ul className="flex flex-col gap-gap-m">
      {postings.map((posting) => (
        <li key={posting.id}>
          <ManagedPostingCard posting={posting} />
        </li>
      ))}
    </ul>
  )
}

export { ManagedPostingPanel }

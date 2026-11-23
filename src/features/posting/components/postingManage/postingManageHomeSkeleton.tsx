import { ManagedPostingListSkeleton } from './managedPostingListSkeleton'

const TAB_KEYS = ['published', 'draft', 'closed']

// TODO: 로딩 화면 디자인 확인 필요, 지금은 단체명·버튼, 탭, 공고 카드 순서의 자리
function PostingManageHomeSkeleton() {
  return (
    <div
      role="status"
      aria-busy
      aria-label="운영진 홈 불러오는 중"
      className="flex flex-col gap-12"
    >
      <div aria-hidden className="flex min-h-10 animate-skeleton-delayed-show items-center">
        <span className="skeleton-bar h-9 w-40 rounded-full" />
        <span className="skeleton-bar ml-auto h-10 w-28 rounded-m" />
      </div>
      <div aria-hidden className="flex flex-col gap-gap-xl">
        <div className="flex min-h-12 animate-skeleton-delayed-show items-end gap-gap-l border-b border-neutral-subtle pb-3">
          {TAB_KEYS.map((key) => (
            <span key={key} className="skeleton-bar h-5 w-20 rounded-full" />
          ))}
        </div>
        <ManagedPostingListSkeleton />
      </div>
    </div>
  )
}

export { PostingManageHomeSkeleton }

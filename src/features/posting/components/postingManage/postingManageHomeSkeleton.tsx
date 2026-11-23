// TODO: 로딩 화면 디자인 확인 필요
function PostingManageHomeSkeleton() {
  return (
    <div role="status" aria-busy aria-label="운영진 홈 불러오는 중">
      <span
        aria-hidden
        className="skeleton-bar block h-9 w-40 animate-skeleton-delayed-show rounded-full"
      />
    </div>
  )
}

export { PostingManageHomeSkeleton }

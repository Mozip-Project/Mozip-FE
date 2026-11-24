// TODO: 로딩 화면 디자인 확인 필요, 지금은 제목·버튼, 상세 카드·미리보기 카드 자리
function PostingManageDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy
      aria-label="공고 관리 상세 불러오는 중"
      className="flex flex-col gap-gap-xl"
    >
      <div aria-hidden className="flex min-h-10 animate-skeleton-delayed-show items-center">
        <span className="skeleton-bar h-9 w-60 rounded-full" />
        <span className="skeleton-bar ml-auto h-10 w-56 rounded-m" />
      </div>
      <div
        aria-hidden
        className="flex animate-skeleton-delayed-show flex-col gap-gap-l desktop:flex-row"
      >
        <span className="skeleton-bar h-120 min-w-0 flex-1 rounded-l" />
        <span className="skeleton-bar h-96 rounded-l desktop:w-80.5" />
      </div>
    </div>
  )
}

export { PostingManageDetailSkeleton }

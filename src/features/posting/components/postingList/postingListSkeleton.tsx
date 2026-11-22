type PostingListSkeletonProps = {
  cardCount: number
}

// TODO: 로딩 화면 디자인 확인 필요, 카드 자리는 JobCard와 같은 높이·배치
function PostingListSkeleton({ cardCount }: PostingListSkeletonProps) {
  const cardKeys = Array.from({ length: cardCount }, (_, index) => index)

  return (
    <div role="status" className="flex flex-col gap-gap-l">
      <span className="sr-only">공고 목록 불러오는 중</span>
      <div aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-l">
        <div className="flex h-9 items-center">
          <span className="skeleton-bar h-4 w-16 rounded-full" />
        </div>
        <ul className="grid grid-cols-3 gap-gap-xl">
          {cardKeys.map((key) => (
            <li key={key} className="flex min-h-68 flex-col">
              <span className="skeleton-bar h-40 w-full rounded-l" />
              <div className="flex flex-col gap-gap-s px-0.5 py-padding-m">
                <div className="flex flex-col gap-gap-xs">
                  <span className="skeleton-bar h-4.5 w-24 rounded-full" />
                  <span className="skeleton-bar h-6.5 w-4/5 rounded-full" />
                </div>
                <div className="flex gap-gap-xs">
                  <span className="skeleton-bar h-6 w-10 rounded-xs" />
                  <span className="skeleton-bar h-6 w-10 rounded-xs" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { PostingListSkeleton }

const CARD_KEYS = ['first', 'second']

// TODO: 로딩 화면 디자인 확인 필요, 지금은 공고 카드 높이의 블록
function ManagedPostingListSkeleton() {
  return (
    <div role="status" aria-busy aria-label="공고 목록 불러오는 중">
      <ul aria-hidden className="flex flex-col gap-gap-m">
        {CARD_KEYS.map((key) => (
          // 실제 카드와 높이를 맞춰 내용이 들어올 때 아래 밀림 방지
          <li key={key} className="skeleton-bar h-75 animate-skeleton-delayed-show rounded-l" />
        ))}
      </ul>
    </div>
  )
}

export { ManagedPostingListSkeleton }

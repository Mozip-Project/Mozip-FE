const CARD_KEYS = ['first', 'second', 'third']

// Figma 불러오는 중 카드: 제목 두 줄, 단계 줄, 안내 바
function MyApplicationListSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">지원 내역을 불러오는 중</span>
      <ul aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-l">
        {CARD_KEYS.map((key) => (
          <li
            key={key}
            className="flex flex-col gap-5 rounded-l border border-neutral-muted bg-layer-default p-padding-xl"
          >
            <div className="flex flex-col gap-gap-m">
              <span className="skeleton-bar h-3 w-90 max-w-full rounded-xs" />
              <span className="skeleton-bar h-3 w-30 rounded-xs" />
            </div>
            <div className="flex items-center gap-gap-l">
              <span className="skeleton-bar size-8 shrink-0 rounded-full" />
              <span className="skeleton-bar h-1 min-w-0 flex-1 rounded-m" />
              <span className="skeleton-bar size-8 shrink-0 rounded-full" />
              <span className="skeleton-bar h-1 min-w-0 flex-1 rounded-m" />
              <span className="skeleton-bar size-8 shrink-0 rounded-full" />
            </div>
            <span className="skeleton-bar h-18 w-full rounded-m" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export { MyApplicationListSkeleton }

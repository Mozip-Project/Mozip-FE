const SKELETON_ROW_COUNT = 5
const SKELETON_ROW_KEYS = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index)

function NotificationPanelSkeleton() {
  return (
    <div role="status" className="min-h-0 flex-1 overflow-hidden">
      <span className="sr-only">알림을 불러오는 중</span>
      <div aria-hidden className="divide-y divide-neutral-subtle">
        {SKELETON_ROW_KEYS.map((key) => (
          <div
            key={key}
            className="flex animate-skeleton-delayed-show flex-col gap-gap-xxs px-padding-l py-padding-m"
          >
            <span className="skeleton-bar h-3.5 w-16 rounded-full" />
            <span className="skeleton-bar h-4.5 w-52 rounded-full" />
            <span className="skeleton-bar h-3.5 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { NotificationPanelSkeleton }

const DEFAULT_ROW_COUNT = 5

type NotificationPanelSkeletonProps = {
  rowCount?: number
  label?: string
}

function NotificationPanelSkeleton({
  rowCount = DEFAULT_ROW_COUNT,
  label = '알림을 불러오는 중',
}: NotificationPanelSkeletonProps) {
  const rowKeys = Array.from({ length: rowCount }, (_, index) => index)

  return (
    <div role="status" className="min-h-0 flex-1 overflow-hidden">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="divide-y divide-neutral-subtle">
        {rowKeys.map((key) => (
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

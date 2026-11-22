type NotificationSettingsSkeletonProps = {
  optionCount: number
}

// TODO: 로딩 화면 디자인 확인 필요
function NotificationSettingsSkeleton({ optionCount }: NotificationSettingsSkeletonProps) {
  return (
    <div
      aria-busy
      aria-label="알림 설정 불러오는 중"
      role="status"
      className="flex flex-col gap-gap-l"
    >
      {Array.from({ length: optionCount }, (_, index) => (
        <div
          // 고정 개수의 자리 표시라 순서가 바뀌지 않음
          key={index}
          aria-hidden
          className="flex animate-skeleton-delayed-show items-center gap-gap-l"
        >
          <span className="skeleton-bar h-5 flex-1 rounded-full" />
          <span className="skeleton-bar h-6 w-10 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export { NotificationSettingsSkeleton }

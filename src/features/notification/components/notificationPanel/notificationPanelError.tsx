import BellIcon from '@/assets/icons/bell.svg'

// TODO: 오류 상태 디자인 확인 필요
function NotificationPanelError() {
  return (
    <div
      role="alert"
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-gap-m pb-15"
    >
      <div
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-weak text-neutral-faint"
      >
        <BellIcon className="size-6" />
      </div>
      <p className="text-body2 font-semibold text-neutral-muted">알림을 불러오지 못했어요</p>
    </div>
  )
}

export { NotificationPanelError }

import Link from 'next/link'
import { useState } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import { Chip } from '@/components/ui/Chip/chip'
import { PopoverClose } from '@/components/ui/Popover/popover'
import { useNotificationPanel } from '@/features/notification/hooks/useNotificationPanel'
import type { NotificationAudience, NotificationEntry } from '@/features/notification/types'
import { NotificationItem } from './notificationItem'
import { NotificationPanelError } from './notificationPanelError'
import { NotificationPanelSkeleton } from './notificationPanelSkeleton'

const NOTIFICATION_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'organizer', label: '운영진' },
  { value: 'applicant', label: '지원자' },
] as const satisfies readonly { value: NotificationAudience | 'all'; label: string }[]

type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]['value']

function filterNotifications(notifications: NotificationEntry[], filter: NotificationFilter) {
  if (filter === 'all') {
    return notifications
  }
  return notifications.filter((notification) => notification.audience === filter)
}

// 패널이 열릴 때만 마운트되어 열 때마다 조회
function NotificationPanelBody() {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const { notifications, isLoading, hasLoadError, markAsRead } = useNotificationPanel()
  const visibleNotifications = notifications ? filterNotifications(notifications, filter) : []

  return (
    <>
      <div
        role="group"
        aria-label="알림 필터"
        className="flex shrink-0 gap-gap-xs border-b border-neutral-subtle px-padding-l py-padding-s"
      >
        {NOTIFICATION_FILTERS.map(({ value, label }) => (
          <Chip key={value} pressed={filter === value} onPressedChange={() => setFilter(value)}>
            {label} {notifications && filterNotifications(notifications, value).length}
          </Chip>
        ))}
      </div>

      {isLoading && <NotificationPanelSkeleton />}

      {hasLoadError && <NotificationPanelError />}

      {notifications && visibleNotifications.length === 0 && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-gap-m pb-15">
          <div
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-weak text-neutral-faint"
          >
            <BellIcon className="size-6" />
          </div>
          <div className="flex flex-col items-center gap-gap-xxs text-center">
            <p className="text-body2 font-semibold text-neutral-muted">아직 받은 알림이 없어요</p>
            <p className="text-label2 font-normal text-neutral-subtle">
              새로운 알림이 도착하면 알려드릴게요
            </p>
          </div>
        </div>
      )}

      {visibleNotifications.length > 0 && (
        <ul
          aria-label="알림 목록"
          className="min-h-0 flex-1 [scrollbar-width:none] divide-y divide-neutral-subtle overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          {visibleNotifications.map((notification) => {
            const { id, href, isRead, source, title, meta } = notification
            const item = (
              <NotificationItem isRead={isRead} source={source} title={title} meta={meta} />
            )

            return (
              <li key={id}>
                {href ? (
                  <PopoverClose asChild>
                    <Link
                      href={href}
                      onClick={() => markAsRead(notification)}
                      className="block outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                    >
                      {item}
                    </Link>
                  </PopoverClose>
                ) : (
                  item
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export { NotificationPanelBody }

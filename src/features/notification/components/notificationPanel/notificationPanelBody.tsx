import Link from 'next/link'
import { useState } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import { Chip } from '@/components/ui/Chip/chip'
import { PopoverClose } from '@/components/ui/Popover/popover'
import { useNotificationPanel } from '@/features/notification/hooks/useNotificationPanel'
import type { NotificationAudience } from '@/features/notification/types'
import type { Role } from '@/gql/graphql'
import { useInViewTrigger } from '@/hooks/useInViewTrigger'
import { NotificationItem } from './notificationItem'
import { NotificationPanelError } from './notificationPanelError'
import { NotificationPanelSkeleton } from './notificationPanelSkeleton'

const LOAD_MORE_SKELETON_ROW_COUNT = 2

const NOTIFICATION_FILTERS = [
  { value: 'all', label: '전체', role: undefined },
  { value: 'organizer', label: '운영진', role: 'OPERATOR' },
  { value: 'applicant', label: '지원자', role: 'APPLICANT' },
] as const satisfies readonly {
  value: NotificationAudience | 'all'
  label: string
  role: Role | undefined
}[]

type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]['value']

// 패널이 열릴 때만 마운트되어 열 때마다 조회
function NotificationPanelBody() {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const selectedRole = NOTIFICATION_FILTERS.find(({ value }) => value === filter)?.role
  const {
    notifications,
    unreadCount,
    isLoading,
    hasLoadError,
    canLoadMore,
    isLoadingMore,
    loadMore,
    markAsRead,
  } = useNotificationPanel(selectedRole)
  const loadMoreTriggerRef = useInViewTrigger<HTMLDivElement>(loadMore, canLoadMore)

  return (
    <>
      <div
        role="group"
        aria-label="알림 필터"
        className="flex shrink-0 gap-gap-xs border-b border-neutral-subtle px-padding-l py-padding-s"
      >
        {NOTIFICATION_FILTERS.map(({ value, label }) => (
          <Chip key={value} pressed={filter === value} onPressedChange={() => setFilter(value)}>
            {/* TODO: 탭별 개수가 서버에 생기면 운영진·지원자 칩에도 표시 */}
            {label} {value === 'all' && unreadCount}
          </Chip>
        ))}
      </div>

      {isLoading && <NotificationPanelSkeleton />}

      {hasLoadError && <NotificationPanelError />}

      {notifications?.length === 0 && (
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

      {notifications && notifications.length > 0 && (
        // 탭마다 새로 그려 캐시된 탭으로 바꿔도 맨 위부터 표시
        <div
          key={filter}
          className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <ul aria-label="알림 목록" className="divide-y divide-neutral-subtle">
            {notifications.map((notification) => {
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
          {canLoadMore && <div ref={loadMoreTriggerRef} aria-hidden className="h-px" />}
          {isLoadingMore && (
            <div className="border-t border-neutral-subtle">
              <NotificationPanelSkeleton
                rowCount={LOAD_MORE_SKELETON_ROW_COUNT}
                label="알림을 더 불러오는 중"
              />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export { NotificationPanelBody }

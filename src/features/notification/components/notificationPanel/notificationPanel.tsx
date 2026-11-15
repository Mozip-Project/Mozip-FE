'use client'

import Link from 'next/link'
import { useId, useRef, useState, type ComponentProps } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import CloseIcon from '@/assets/icons/close.svg'
import SettingsIcon from '@/assets/icons/settings.svg'
import { Button } from '@/components/ui/Button/button'
import { Chip } from '@/components/ui/Chip/chip'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover/popover'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { NotificationItem } from './notificationItem'
import type { Route } from 'next'

const NOTIFICATION_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'organizer', label: '운영진' },
  { value: 'applicant', label: '지원자' },
] as const

type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]['value']

type NotificationEntry = ComponentProps<typeof NotificationItem> & {
  id: string
  audience: Exclude<NotificationFilter, 'all'>
  href: Route
}

type NotificationPanelProps = {
  notifications: NotificationEntry[]
  settingsHref: Route
  defaultOpen?: boolean
}

const NOTIFICATION_PANEL_SIDE_OFFSET_PX = 8

const ICON_BUTTON_CLASS =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid'

function filterNotifications(notifications: NotificationEntry[], filter: NotificationFilter) {
  if (filter === 'all') {
    return notifications
  }
  return notifications.filter((notification) => notification.audience === filter)
}

function NotificationPanel({ notifications, settingsHref, defaultOpen }: NotificationPanelProps) {
  const titleId = useId()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const visibleNotifications = filterNotifications(notifications, filter)
  const panelRef = useRef<HTMLDivElement>(null)
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  function handleOpenAutoFocus(event: Event) {
    if (isPointerFocus) {
      event.preventDefault()
      panelRef.current?.focus()
    }
  }

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger
        asChild
        data-pointer-focus={isPointerFocus ? '' : undefined}
        onPointerDown={markPointerFocus}
      >
        <Button
          variant="tertiary"
          size="m"
          aria-label="알림"
          className="size-10 text-neutral data-pointer-focus:focus-visible:outline-none"
        >
          <BellIcon aria-hidden className="size-4.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={panelRef}
        data-slot="notification-panel"
        aria-labelledby={titleId}
        align="end"
        sideOffset={NOTIFICATION_PANEL_SIDE_OFFSET_PX}
        onOpenAutoFocus={handleOpenAutoFocus}
        className="flex h-155 max-h-(--radix-popover-content-available-height) w-100 min-w-70 flex-col overflow-hidden rounded-xl"
      >
        <div className="flex shrink-0 items-center gap-gap-xxs pt-padding-m pr-padding-s pb-padding-xs pl-padding-l">
          <h2 id={titleId} className="min-w-0 flex-1 text-heading2 font-bold text-neutral">
            알림
          </h2>
          <PopoverClose asChild>
            <Link href={settingsHref} aria-label="알림 설정" className={ICON_BUTTON_CLASS}>
              <SettingsIcon aria-hidden className="size-5" />
            </Link>
          </PopoverClose>
          <PopoverClose aria-label="닫기" className={ICON_BUTTON_CLASS}>
            <CloseIcon aria-hidden />
          </PopoverClose>
        </div>

        <div
          role="group"
          aria-label="알림 필터"
          className="flex shrink-0 gap-gap-xs border-b border-neutral-subtle px-padding-l py-padding-s"
        >
          {NOTIFICATION_FILTERS.map(({ value, label }) => (
            <Chip key={value} pressed={filter === value} onPressedChange={() => setFilter(value)}>
              {label} {filterNotifications(notifications, value).length}
            </Chip>
          ))}
        </div>

        {visibleNotifications.length === 0 ? (
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
        ) : (
          <ul
            aria-label="알림 목록"
            className="min-h-0 flex-1 [scrollbar-width:none] divide-y divide-neutral-subtle overflow-y-auto [&::-webkit-scrollbar]:hidden"
          >
            {visibleNotifications.map(({ id, href, isRead, source, title, meta }) => (
              <li key={id}>
                <PopoverClose asChild>
                  <Link
                    href={href}
                    className="block outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
                  >
                    <NotificationItem isRead={isRead} source={source} title={title} meta={meta} />
                  </Link>
                </PopoverClose>
              </li>
            ))}
          </ul>
        )}

        <p className="shrink-0 border-t border-neutral-subtle px-padding-l py-padding-s text-center text-caption1 font-normal text-neutral-subtle">
          알림은 30일 이후 자동 삭제됩니다
        </p>
      </PopoverContent>
    </Popover>
  )
}

export { NotificationPanel }
export type { NotificationEntry }

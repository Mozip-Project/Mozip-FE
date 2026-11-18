'use client'

import Link from 'next/link'
import { useId, useRef } from 'react'
import BellIcon from '@/assets/icons/bell.svg'
import CloseIcon from '@/assets/icons/close.svg'
import SettingsIcon from '@/assets/icons/settings.svg'
import { Button } from '@/components/ui/Button/button'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover/popover'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { NotificationPanelBody } from './notificationPanelBody'
import type { Route } from 'next'

type NotificationPanelProps = {
  settingsHref: Route
  defaultOpen?: boolean
}

const NOTIFICATION_PANEL_SIDE_OFFSET_PX = 8

const ICON_BUTTON_CLASS =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-s text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid'

function NotificationPanel({ settingsHref, defaultOpen }: NotificationPanelProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  function handleOpenAutoFocus(event: Event) {
    if (isPointerFocus) {
      event.preventDefault()
      panelRef.current?.focus()
    }
  }

  return (
    // 목록이 짧거나 끝에 닿아도 뒤 페이지가 스크롤되지 않도록 modal로 스크롤 잠금
    <Popover modal defaultOpen={defaultOpen}>
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

        <NotificationPanelBody />

        <p className="shrink-0 border-t border-neutral-subtle px-padding-l py-padding-s text-center text-caption1 font-normal text-neutral-subtle">
          알림은 30일 이후 자동 삭제됩니다
        </p>
      </PopoverContent>
    </Popover>
  )
}

export { NotificationPanel }

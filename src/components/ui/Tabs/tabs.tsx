'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import { getRovingFocusIntent, getRovingFocusTargetIndex } from '@/utils/rovingFocus'
import type { ComponentProps, KeyboardEvent, MouseEvent, PointerEvent } from 'react'

function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('flex', className)} {...props} />
}

type TabStatusTone = 'positive' | 'critical'

const STATUS_DOT_CLASS = {
  positive: 'bg-positive-solid',
  critical: 'bg-critical-solid',
} satisfies Record<TabStatusTone, string>

type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger> & {
  // null은 개수 확인 중, '-'로 표시
  count?: number | null
  // 색 외에 보조 기술용 label 제공
  status?: { tone: TabStatusTone; label: string }
}

function TabsTrigger({
  className,
  children,
  count,
  status,
  onPointerDown,
  onMouseDown,
  onKeyDown,
  ...props
}: TabsTriggerProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    onPointerDown?.(event)
    markPointerFocus()
  }

  // 기본 처리를 건너뛰고 스크롤 없이 focus
  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    onMouseDown?.(event)

    const isPrimaryClick = event.button === 0 && !event.ctrlKey

    if (event.defaultPrevented || !isPrimaryClick) {
      return
    }

    event.preventDefault()

    const trigger = event.currentTarget

    // 이미 focus된 미선택 탭은 focus 이벤트가 안 생겨 선택 안 되는 문제 방지
    if (document.activeElement === trigger && trigger.dataset.state !== 'active') {
      trigger.blur()
    }
    trigger.focus({ preventScroll: true })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event)

    const intent = getRovingFocusIntent(event.key)
    const hasModifier = event.metaKey || event.ctrlKey || event.altKey || event.shiftKey

    if (event.defaultPrevented || !intent || hasModifier) {
      return
    }

    const tabList = event.currentTarget.closest('[role=tablist]')
    const tabs = Array.from(
      tabList?.querySelectorAll<HTMLButtonElement>('[role=tab]:not(:disabled)') ?? [],
    )
    const currentIndex = tabs.indexOf(event.currentTarget)

    if (currentIndex === -1) {
      return
    }

    event.preventDefault()
    tabs[getRovingFocusTargetIndex(intent, currentIndex, tabs.length)]?.focus({
      preventScroll: true,
    })
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-pointer-focus={isPointerFocus ? '' : undefined}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center gap-gap-xs p-padding-s',
        'text-body1 font-medium whitespace-nowrap text-neutral-subtle select-none',
        'outline-none not-data-pointer-focus:focus-visible:outline-2 not-data-pointer-focus:focus-visible:-outline-offset-2 not-data-pointer-focus:focus-visible:outline-focus-ring not-data-pointer-focus:focus-visible:outline-solid',
        'data-[state=active]:font-semibold data-[state=active]:text-neutral',
        'after:absolute after:inset-x-0 after:bottom-0 after:border-b-2 after:border-neutral-contrast after:opacity-0 data-[state=active]:after:opacity-100',
        'disabled:pointer-events-none disabled:text-disabled',
        className,
      )}
      {...props}
    >
      {children}
      {/* 접근 가능한 이름의 라벨·개수 구분용 공백 */}
      {count !== undefined && (
        <>
          {' '}
          {/* 스크린리더의 '하이픈' 읽기 방지 */}
          {count === null ? <span aria-hidden>-</span> : <span>{count}</span>}
        </>
      )}
      {status && (
        <>
          {' '}
          <span
            aria-hidden
            data-slot="tabs-trigger-status"
            className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT_CLASS[status.tone])}
          />
          <span className="sr-only">{status.label}</span>
        </>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent(props: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger }

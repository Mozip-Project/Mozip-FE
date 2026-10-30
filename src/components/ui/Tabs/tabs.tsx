'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import { usePointerFocus } from '@/hooks/usePointerFocus'
import { cn } from '@/lib/utils'
import type { ComponentProps, PointerEvent } from 'react'

function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('flex', className)} {...props} />
}

type TabsTriggerProps = ComponentProps<typeof TabsPrimitive.Trigger> & {
  count?: number
}

function TabsTrigger({ className, children, count, onPointerDown, ...props }: TabsTriggerProps) {
  const { isPointerFocus, markPointerFocus } = usePointerFocus()

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    onPointerDown?.(event)
    markPointerFocus()
  }

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-pointer-focus={isPointerFocus ? '' : undefined}
      onPointerDown={handlePointerDown}
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
          <span>{count}</span>
        </>
      )}
    </TabsPrimitive.Trigger>
  )
}

function TabsContent(props: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger }

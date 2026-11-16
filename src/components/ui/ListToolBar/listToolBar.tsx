'use client'

import { useRef, type ReactNode } from 'react'
import { scrollToStickyBarTop, StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'

type ListToolBarTab<TValue extends string> = {
  value: TValue
  label: string
  count?: number | null
}

type ListToolBarProps<TValue extends string> = {
  tabs: readonly ListToolBarTab<TValue>[]
  tabsLabel: string
  value: TValue
  onValueChange: (value: TValue) => void
  controls?: ReactNode
  children?: ReactNode
}

function ListToolBar<TValue extends string>({
  tabs,
  tabsLabel,
  value,
  onValueChange,
  controls,
  children,
}: ListToolBarProps<TValue>) {
  const listTopRef = useRef<HTMLDivElement>(null)

  function handleValueChange(nextValue: string) {
    const nextTab = tabs.find((tab) => tab.value === nextValue)

    if (!nextTab) {
      return
    }

    if (listTopRef.current) {
      scrollToStickyBarTop(listTopRef.current)
    }
    onValueChange(nextTab.value)
  }

  return (
    <Tabs ref={listTopRef} value={value} onValueChange={handleValueChange}>
      <StickyTopBar>
        <div
          data-slot="list-tool-bar"
          className="relative flex min-h-12 flex-wrap items-center gap-x-gap-s before:absolute before:inset-x-0 before:bottom-0 before:border-b before:border-neutral-subtle"
        >
          <TabsList aria-label={tabsLabel} className="self-end">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} count={tab.count}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {controls && <div className="ml-auto flex items-center gap-gap-xs">{controls}</div>}
        </div>
      </StickyTopBar>
      <TabsContent value={value} data-sticky-bar-content="">
        {children}
      </TabsContent>
    </Tabs>
  )
}

export { ListToolBar }

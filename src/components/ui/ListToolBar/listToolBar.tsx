'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type ListToolBarTab<TValue extends string> = {
  value: TValue
  label: string
  count?: number
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
  function handleValueChange(nextValue: string) {
    const nextTab = tabs.find((tab) => tab.value === nextValue)

    if (nextTab) {
      onValueChange(nextTab.value)
    }
  }

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <div
        data-slot="list-tool-bar"
        className={cn(
          'relative flex min-h-12 flex-wrap items-center gap-x-gap-s',
          'before:absolute before:inset-x-0 before:bottom-0 before:border-b before:border-neutral-subtle',
        )}
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
      <TabsContent value={value}>{children}</TabsContent>
    </Tabs>
  )
}

export { ListToolBar }

'use client'

import { useRef, type ReactNode } from 'react'
import { scrollToStickyBarTop, StickyTopBar } from '@/components/ui/StickyTopBar/stickyTopBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/tabs'
import { useStickyTopBarHeight } from '@/hooks/useStickyTopBarHeight'

type ListToolBarTab<TValue extends string> = {
  value: TValue
  label: string
  count?: number | null
  // 아직 열 수 없는 탭, 골라도 탭과 스크롤 위치 유지
  isUnavailable?: boolean
}

type ListToolBarProps<TValue extends string> = {
  tabs: readonly ListToolBarTab<TValue>[]
  tabsLabel: string
  value: TValue
  onValueChange: (value: TValue) => void
  controls?: ReactNode
  // 탭바와 함께 고정할 페이지 헤더
  header?: ReactNode
  // 고정 중 아래 8px 여백, 내용 위 여백이 8px 이상일 때만 사용
  hasBottomGap?: boolean
  // 첫 진입 로딩 중 조작 차단, 헤더는 제외해 제목을 읽을 수 있게 유지
  isInert?: boolean
  children?: ReactNode
}

function ListToolBar<TValue extends string>({
  tabs,
  tabsLabel,
  value,
  onValueChange,
  controls,
  header,
  hasBottomGap = false,
  isInert = false,
  children,
}: ListToolBarProps<TValue>) {
  const listTopRef = useRef<HTMLDivElement>(null)

  function handleValueChange(nextValue: string) {
    const nextTab = tabs.find((tab) => tab.value === nextValue)

    // 열 수 없는 탭은 focus만으로 선택되지 않게 클릭·Enter에서만 따로 알림
    if (!nextTab || nextTab.isUnavailable) {
      return
    }

    if (listTopRef.current) {
      scrollToStickyBarTop(listTopRef.current)
    }
    onValueChange(nextTab.value)
  }

  const toolBar = (
    <div
      data-slot="list-tool-bar"
      inert={isInert}
      className="relative flex min-h-12 flex-wrap items-center gap-x-gap-s before:absolute before:inset-x-0 before:bottom-0 before:border-b before:border-neutral-subtle"
    >
      <TabsList aria-label={tabsLabel} className="self-end">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            count={tab.count}
            onClick={tab.isUnavailable ? () => onValueChange(tab.value) : undefined}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {controls && <div className="ml-auto flex items-center gap-gap-xs">{controls}</div>}
    </div>
  )

  return (
    <Tabs ref={listTopRef} value={value} onValueChange={handleValueChange}>
      {/* 음수 margin으로 처음 배치는 그대로 */}
      <StickyTopBar className={hasBottomGap ? '-mb-gap-s' : undefined}>
        {header || hasBottomGap ? (
          <MeasuredBarContent className={hasBottomGap ? 'pb-gap-s' : undefined}>
            {header && <div className="pb-gap-xl">{header}</div>}
            {toolBar}
          </MeasuredBarContent>
        ) : (
          toolBar
        )}
      </StickyTopBar>
      <TabsContent value={value} inert={isInert} data-sticky-bar-content="">
        {children}
      </TabsContent>
    </Tabs>
  )
}

type MeasuredBarContentProps = {
  className?: string
  children: ReactNode
}

// 헤더·아래 여백까지 포함한 고정 바 높이로 scroll-padding 보정, focus 요소가 바에 가려지지 않게 처리
function MeasuredBarContent({ className, children }: MeasuredBarContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  useStickyTopBarHeight(ref)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export { ListToolBar }

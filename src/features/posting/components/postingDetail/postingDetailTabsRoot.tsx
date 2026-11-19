'use client'

import { useRef, type ReactNode } from 'react'
import { scrollToStickyBarTop } from '@/components/ui/StickyTopBar/stickyTopBar'
import { Tabs } from '@/components/ui/Tabs/tabs'

type PostingDetailTabsRootProps = {
  defaultValue: string
  children: ReactNode
}

function PostingDetailTabsRoot({ defaultValue, children }: PostingDetailTabsRootProps) {
  const tabsRef = useRef<HTMLDivElement>(null)

  // 탭바가 고정된 채 바꾸면 다른 탭 화면과 같이 새 탭 내용 맨 위가 탭바 바로 아래 오도록 스크롤
  function handleValueChange() {
    if (tabsRef.current) {
      scrollToStickyBarTop(tabsRef.current)
    }
  }

  return (
    <Tabs
      ref={tabsRef}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      className="flex flex-col gap-gap-xl"
    >
      {children}
    </Tabs>
  )
}

export { PostingDetailTabsRoot }

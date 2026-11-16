'use client'

import { useRef, type ReactNode } from 'react'
import { useHideOnScrollDown } from '@/hooks/useHideOnScrollDown'

const GNB_HEIGHT_PX = 64

type GnbHeaderProps = {
  children: ReactNode
}

function GnbHeader({ children }: GnbHeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  const { isHidden, isRevealed, reveal } = useHideOnScrollDown(GNB_HEIGHT_PX, {
    // 연 패널이나 키보드 focus가 있으면 숨기지 않음
    canHide: () => !headerRef.current?.querySelector('[data-state=open], :focus-visible'),
  })

  return (
    <header
      ref={headerRef}
      data-slot="gnb"
      data-hidden={isHidden ? '' : undefined}
      data-revealed={isRevealed ? '' : undefined}
      onFocus={reveal}
      className="sticky top-0 z-20 border-b border-neutral-subtle bg-layer-default px-page-padding transition-transform duration-200 ease-out data-hidden:-translate-y-full motion-reduce:transition-none"
    >
      {children}
    </header>
  )
}

export { GnbHeader }

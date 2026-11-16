'use client'

import { useRef, useState, type ReactNode } from 'react'
import { scrollWithoutRevealing } from '@/hooks/useHideOnScrollDown'
import { useIsStuckToTop } from '@/hooks/useIsStuckToTop'
import { cn } from '@/lib/utils'
import { canReleaseKeptHeight } from '@/utils/keptHeight'

const STICKY_TOP_PX = 48
const REVEALED_STICKY_TOP_PX = 112

const KEPT_HEIGHT_VAR = '--kept-height'

type StickyTopBarProps = {
  children: ReactNode
  className?: string
}

// 화면 위 고정 바, 고정 중에는 위 여백을 배경으로 가려 뒤 내용 비침 방지
function StickyTopBar({ children, className }: StickyTopBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isStuck = useIsStuckToTop(ref, STICKY_TOP_PX)
  const isStuckBelowRevealedGnb = useIsStuckToTop(ref, REVEALED_STICKY_TOP_PX)
  const [isCoveringAbove, setIsCoveringAbove] = useState(false)
  // 48px에서 켜고 112px 아래로 내려가야 끔, GNB가 오가는 동안 배경 깜빡임 방지
  let nextIsCoveringAbove = isCoveringAbove

  if (isStuck) {
    nextIsCoveringAbove = true
  } else if (!isStuckBelowRevealedGnb) {
    nextIsCoveringAbove = false
  }

  if (nextIsCoveringAbove !== isCoveringAbove) {
    setIsCoveringAbove(nextIsCoveringAbove)
  }

  return (
    <div
      ref={ref}
      data-sticky-top-bar=""
      data-stuck={nextIsCoveringAbove ? '' : undefined}
      data-stuck-revealed={isStuckBelowRevealedGnb ? '' : undefined}
      className={cn(
        'sticky-below-gnb z-10 bg-layer-default',
        'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-full after:h-(--sticky-top) after:bg-layer-default after:opacity-0 after:transition-opacity after:duration-100 motion-reduce:after:transition-none',
        'data-stuck:after:pointer-events-auto data-stuck:after:opacity-100',
        'gnb-revealed:data-stuck-revealed:after:pointer-events-auto gnb-revealed:data-stuck-revealed:after:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  )
}

// 한 화면에 목록 하나라 모듈 변수로 관리
let releaseKeptContentHeight: (() => void) | null = null

// 숨겨진 비활성 탭 패널은 크기가 0이라 제외하고 보이는 마지막 자식 기준
function getContentHeight(content: HTMLElement) {
  const lastVisibleChild = Array.from(content.children).findLast(
    (child) => child.getClientRects().length > 0,
  )

  if (!lastVisibleChild) {
    return 0
  }

  return lastVisibleChild.getBoundingClientRect().bottom - content.getBoundingClientRect().top
}

// 새 내용이 짧아져 스크롤이 위로 당겨지는 문제 방지, 직전 높이 유지 후 안전한 위치에서 해제
function keepContentHeight(content: HTMLElement) {
  // 이전 유지를 풀기 전에 측정
  const keptHeightPx = content.offsetHeight
  releaseKeptContentHeight?.()

  function release() {
    content.style.removeProperty(KEPT_HEIGHT_VAR)
    delete content.dataset.keptHeight
    window.removeEventListener('scroll', handleScroll)
    releaseKeptContentHeight = null
  }

  function handleScroll() {
    if (!content.isConnected) {
      release()
      return
    }

    const html = document.documentElement
    const canRelease = canReleaseKeptHeight({
      scrollY: window.scrollY,
      documentHeight: html.scrollHeight,
      viewportHeight: html.clientHeight,
      extraHeight: content.offsetHeight - getContentHeight(content),
    })

    if (canRelease) {
      release()
    }
  }

  content.style.setProperty(KEPT_HEIGHT_VAR, `${keptHeightPx}px`)
  content.dataset.keptHeight = ''
  window.addEventListener('scroll', handleScroll, { passive: true })
  releaseKeptContentHeight = release
}

// 탭, 필터 변경 직전 호출
// 바가 고정돼 있으면 내용 맨 위를 바 바로 아래로 스크롤
function scrollToStickyBarTop(container: Element) {
  const bar = container.querySelector('[data-sticky-top-bar]')

  if (!bar) {
    return
  }

  const containerTopPx = container.getBoundingClientRect().top
  const isStuck = containerTopPx < bar.getBoundingClientRect().top

  if (!isStuck) {
    return
  }

  const content = container.querySelector<HTMLElement>('[data-sticky-bar-content]')

  if (content) {
    keepContentHeight(content)
  }
  scrollWithoutRevealing(window.scrollY + containerTopPx - getFinalStickyTopPx())
}

// GNB 표시 전환 중에는 바의 현재 위치가 중간값이라 전환이 끝난 고정 위치 사용
function getFinalStickyTopPx() {
  const isGnbRevealed = document.querySelector("[data-slot='gnb'][data-revealed]") !== null

  return isGnbRevealed ? REVEALED_STICKY_TOP_PX : STICKY_TOP_PX
}

export { scrollToStickyBarTop, StickyTopBar }

'use client'

import { useEffect, type RefObject } from 'react'

const STICKY_TOP_BAR_HEIGHT_VAR = '--sticky-top-bar-height'

// 기본(48px)보다 높은 고정 바의 실제 높이를 html에 반영, focus 요소가 바에 가려지지 않게 scroll-padding 보정
function useStickyTopBarHeight(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    const root = document.documentElement
    const observer = new ResizeObserver(() => {
      root.style.setProperty(STICKY_TOP_BAR_HEIGHT_VAR, `${element.offsetHeight}px`)
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      root.style.removeProperty(STICKY_TOP_BAR_HEIGHT_VAR)
    }
  }, [ref])
}

export { useStickyTopBarHeight }

import { useEffect, useState, type RefObject } from 'react'

// 확대, 축소 시 소수점 위치 오차 허용
const STUCK_TOLERANCE_PX = 1

// stickyTopPx: 요소의 sticky top 값
function useIsStuckToTop(ref: RefObject<Element | null>, stickyTopPx: number) {
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    let frameId: number | null = null

    const update = () => {
      frameId = null
      setIsStuck(element.getBoundingClientRect().top < stickyTopPx + STUCK_TOLERANCE_PX)
    }

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(update)
      }
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    // GNB 표시 전환으로 top이 바뀌는 동안은 스크롤 없이 위치 이동
    element.addEventListener('transitionend', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      element.removeEventListener('transitionend', scheduleUpdate)

      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [ref, stickyTopPx])

  return isStuck
}

export { useIsStuckToTop }

import { useEffect, useState, type RefObject } from 'react'

// stickyTopPx: 요소의 sticky top 값
function useIsStuckToTop(ref: RefObject<Element | null>, stickyTopPx: number) {
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.rootBounds) {
          return
        }

        setIsStuck(
          entry.intersectionRatio < 1 && entry.boundingClientRect.top < entry.rootBounds.top,
        )
      },
      // 1px 더 줄여 고정 시 교차 비율 1 미만 처리
      { rootMargin: `-${stickyTopPx + 1}px 0px 0px 0px`, threshold: 1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, stickyTopPx])

  return isStuck
}

export { useIsStuckToTop }

import { useEffect, useRef, useState } from 'react'

// sticky 요소가 화면 하단에 붙어 있는지 감지, 바닥 간격은 요소의 bottom 값과 같게 전달
function useIsStuckToBottom<TElement extends Element>(bottomOffsetPx: number) {
  const ref = useRef<TElement>(null)
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
          entry.intersectionRatio < 1 && entry.boundingClientRect.bottom > entry.rootBounds.bottom,
        )
      },
      // 1px 더 줄여 고정 상태에서 교차 비율이 1 미만이 되게 처리
      { rootMargin: `0px 0px -${bottomOffsetPx + 1}px 0px`, threshold: 1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [bottomOffsetPx])

  return { ref, isStuck }
}

export { useIsStuckToBottom }

import { useEffect, useEffectEvent, useState } from 'react'

// 대상 요소가 화면(스크롤 영역 포함)에 보이면 onInView 실행, 무한스크롤 다음 페이지 요청
function useInViewTrigger<TElement extends Element>(onInView: () => void, isEnabled: boolean) {
  const [target, setTarget] = useState<TElement | null>(null)
  const handleInView = useEffectEvent(onInView)

  useEffect(() => {
    if (!isEnabled || !target) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        handleInView()
      }
    })
    observer.observe(target)

    return () => observer.disconnect()
  }, [isEnabled, target])

  // 요소가 새로 그려지면 다시 관찰하도록 callback ref 반환
  return setTarget
}

export { useInViewTrigger }

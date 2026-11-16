import { useEffect, useEffectEvent, useState } from 'react'

type ScrollVisibility = 'top' | 'hidden' | 'revealed'

let isProgrammaticScroll = false

type HideOnScrollDownOptions = {
  canHide?: () => boolean
}

// 아래로 스크롤하면 숨김, 위로 스크롤하면 다시 표시
function useHideOnScrollDown(
  alwaysVisibleUntilPx: number,
  { canHide }: HideOnScrollDownOptions = {},
) {
  const [visibility, setVisibility] = useState<ScrollVisibility>('top')
  const checkCanHide = useEffectEvent(() => canHide?.() ?? true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    // 중간에서 새로고침하면 scroll 이벤트가 없어 처음 위치로 상태 맞춤
    const initialFrame = requestAnimationFrame(() => {
      if (window.scrollY > alwaysVisibleUntilPx) {
        setVisibility('revealed')
      }
    })

    function handleScroll() {
      const scrollY = window.scrollY
      const isScrollingDown = scrollY > lastScrollY
      const isScrollingUp = scrollY < lastScrollY
      lastScrollY = scrollY

      if (scrollY <= 0) {
        setVisibility('top')
        return
      }

      // 상단 구간은 항상 표시, revealed는 맨 위까지 유지해 고정 요소 튐 방지
      if (scrollY <= alwaysVisibleUntilPx) {
        setVisibility((prev) => (prev === 'hidden' ? 'revealed' : prev))
        return
      }

      // 상단 구간 처리 뒤에 확인, 코드 스크롤이 상단 구간에 닿아도 GNB 표시
      if (isProgrammaticScroll) {
        return
      }

      if (isScrollingDown) {
        setVisibility(checkCanHide() ? 'hidden' : 'revealed')
        return
      }

      if (isScrollingUp) {
        setVisibility('revealed')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      cancelAnimationFrame(initialFrame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [alwaysVisibleUntilPx])

  function reveal() {
    setVisibility((prev) => (prev === 'hidden' ? 'revealed' : prev))
  }

  return { isHidden: visibility === 'hidden', isRevealed: visibility === 'revealed', reveal }
}

// GNB 상태를 바꾸지 않고 스크롤
function scrollWithoutRevealing(topPx: number) {
  isProgrammaticScroll = true
  requestAnimationFrame(() => {
    isProgrammaticScroll = false
  })

  if (Math.round(topPx) !== Math.round(window.scrollY)) {
    window.scrollTo({ top: topPx, behavior: 'instant' })
  }
}

export { scrollWithoutRevealing, useHideOnScrollDown }

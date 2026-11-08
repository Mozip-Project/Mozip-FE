import { useLayoutEffect, useRef, useState } from 'react'
import { getRevealOffset, getSlideOffset } from '@/utils/slideOffset'

type SlideState = {
  canSlidePrev: boolean
  canSlideNext: boolean
}

// 가로 스크롤 영역을 버튼으로도 이동, activeIndex 항목은 보이는 위치로 맞춤
function useHorizontalSlide<TList extends HTMLElement = HTMLUListElement>(activeIndex: number) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<TList>(null)
  const hasRevealedRef = useRef(false)
  // 부드러운 스크롤 도중 다시 누르면 현재 위치가 아닌 목표 위치에서 이어서 계산
  const slideTargetPxRef = useRef<number | null>(null)
  const [slideState, setSlideState] = useState<SlideState>({
    canSlidePrev: false,
    canSlideNext: false,
  })

  // 스크롤 위치·크기가 바뀔 때마다 이전·다음 버튼 상태 갱신
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list) {
      return
    }

    const updateSlideState = () => {
      const maxPx = viewport.scrollWidth - viewport.clientWidth
      // 소수점 스크롤 위치에서 끝에 닿아도 버튼이 남는 문제 방지
      const nextState = {
        canSlidePrev: viewport.scrollLeft > 1,
        canSlideNext: viewport.scrollLeft < maxPx - 1,
      }
      setSlideState((previous) =>
        previous.canSlidePrev === nextState.canSlidePrev &&
        previous.canSlideNext === nextState.canSlideNext
          ? previous
          : nextState,
      )
    }
    const handleScroll = () => {
      updateSlideState()
      const targetPx = slideTargetPxRef.current
      if (targetPx !== null && Math.abs(viewport.scrollLeft - targetPx) <= 1) {
        slideTargetPxRef.current = null
      }
    }
    const clearSlideTarget = () => {
      slideTargetPxRef.current = null
    }

    updateSlideState()
    viewport.addEventListener('scroll', handleScroll, { passive: true })
    viewport.addEventListener('scrollend', clearSlideTarget)
    const observer = new ResizeObserver(updateSlideState)
    observer.observe(viewport)
    observer.observe(list)
    return () => {
      viewport.removeEventListener('scroll', handleScroll)
      viewport.removeEventListener('scrollend', clearSlideTarget)
      observer.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const activeItem = listRef.current?.children[activeIndex]
    if (!viewport || !(activeItem instanceof HTMLElement)) {
      return
    }

    const viewportLeftPx = viewport.getBoundingClientRect().left
    const itemRect = activeItem.getBoundingClientRect()
    const itemStartPx = itemRect.left - viewportLeftPx + viewport.scrollLeft

    slideTargetPxRef.current = null
    viewport.scrollTo({
      left: getRevealOffset({
        previousPx: viewport.scrollLeft,
        itemStartPx,
        itemEndPx: itemStartPx + itemRect.width,
        viewportWidthPx: viewport.clientWidth,
      }),
      // 첫 위치는 애니메이션 없이 적용, 이후는 CSS scroll-behavior 사용
      behavior: hasRevealedRef.current ? 'auto' : 'instant',
    })
    hasRevealedRef.current = true
  }, [activeIndex])

  function slideBy(direction: 1 | -1) {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    const targetPx = getSlideOffset(
      slideTargetPxRef.current ?? viewport.scrollLeft,
      direction * getSlideStep(listRef.current),
      viewport.scrollWidth - viewport.clientWidth,
    )
    slideTargetPxRef.current = targetPx
    viewport.scrollTo({ left: targetPx })
  }

  return {
    viewportRef,
    listRef,
    ...slideState,
    slidePrev: () => slideBy(-1),
    slideNext: () => slideBy(1),
  }
}

function getSlideStep(list: HTMLElement | null) {
  const [firstItem, secondItem] = list?.children ?? []
  if (!(firstItem instanceof HTMLElement) || !(secondItem instanceof HTMLElement)) {
    return 0
  }
  return secondItem.offsetLeft - firstItem.offsetLeft
}

export { useHorizontalSlide }

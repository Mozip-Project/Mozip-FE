import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getRevealOffset, getSlideOffset } from '@/utils/slideOffset'

// viewport 안의 목록을 transform으로 좌우 이동, activeIndex 항목은 보이는 위치로 맞춤
function useHorizontalSlide<TList extends HTMLElement = HTMLUListElement>(activeIndex: number) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<TList>(null)
  const [offset, setOffset] = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [isAnimated, setIsAnimated] = useState(false)

  const offsetPx = Math.min(offset, maxOffset)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list) {
      return
    }

    const updateMaxOffset = () => {
      setMaxOffset(Math.max(list.scrollWidth - viewport.clientWidth, 0))
    }
    updateMaxOffset()
    const observer = new ResizeObserver(updateMaxOffset)
    observer.observe(viewport)
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const activeItem = listRef.current?.children[activeIndex]
    if (activeItem instanceof HTMLElement) {
      setOffset((previousPx) => getItemRevealOffset(previousPx, activeItem, viewportRef.current))
    }
  }, [activeIndex])

  // 첫 위치는 애니메이션 없이 적용
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsAnimated(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // 연속 클릭 시 목표 위치 누적
  function slideBy(direction: 1 | -1) {
    const stepPx = getSlideStep(listRef.current)
    setOffset((previous) =>
      getSlideOffset(Math.min(previous, maxOffset), direction * stepPx, maxOffset),
    )
  }

  function revealItem(item: HTMLElement) {
    setOffset((previousPx) => getItemRevealOffset(previousPx, item, viewportRef.current))
  }

  return {
    viewportRef,
    listRef,
    offsetPx,
    isAnimated,
    canSlidePrev: offsetPx > 0,
    canSlideNext: offsetPx < maxOffset,
    slidePrev: () => slideBy(-1),
    slideNext: () => slideBy(1),
    revealItem,
  }
}

function getSlideStep(list: HTMLElement | null) {
  const [firstItem, secondItem] = list?.children ?? []
  if (!(firstItem instanceof HTMLElement) || !(secondItem instanceof HTMLElement)) {
    return 0
  }
  return secondItem.offsetLeft - firstItem.offsetLeft
}

function getItemRevealOffset(previousPx: number, item: HTMLElement, viewport: HTMLElement | null) {
  return getRevealOffset({
    previousPx,
    itemStartPx: item.offsetLeft,
    itemEndPx: item.offsetLeft + item.offsetWidth,
    viewportWidthPx: viewport?.clientWidth ?? 0,
  })
}

export { useHorizontalSlide }

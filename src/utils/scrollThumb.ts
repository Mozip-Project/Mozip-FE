type ScrollMetrics = {
  scrollLeft: number
  scrollWidth: number
  clientWidth: number
}

type ScrollThumb = {
  hasOverflow: boolean
  isAtStart: boolean
  isAtEnd: boolean
  // 트랙 대비 막대 길이·시작 위치 비율(0~1)
  sizeRatio: number
  offsetRatio: number
}

// 소수점 너비로 양 끝까지 스크롤해도 1px 미만 남는 경우 보정
const END_TOLERANCE_PX = 1

function getScrollThumb({ scrollLeft, scrollWidth, clientWidth }: ScrollMetrics): ScrollThumb {
  const maxScroll = scrollWidth - clientWidth

  if (maxScroll <= END_TOLERANCE_PX) {
    return { hasOverflow: false, isAtStart: true, isAtEnd: true, sizeRatio: 1, offsetRatio: 0 }
  }

  const position = Math.min(Math.max(scrollLeft, 0), maxScroll)
  const sizeRatio = clientWidth / scrollWidth

  return {
    hasOverflow: true,
    isAtStart: position <= END_TOLERANCE_PX,
    isAtEnd: maxScroll - position <= END_TOLERANCE_PX,
    sizeRatio,
    offsetRatio: (position / maxScroll) * (1 - sizeRatio),
  }
}

export { getScrollThumb }
export type { ScrollMetrics, ScrollThumb }

function getSlideOffset(previousPx: number, deltaPx: number, maxPx: number) {
  return Math.min(Math.max(previousPx + deltaPx, 0), maxPx)
}

type RevealRange = {
  previousPx: number
  itemStartPx: number
  itemEndPx: number
  viewportWidthPx: number
}

function getRevealOffset({ previousPx, itemStartPx, itemEndPx, viewportWidthPx }: RevealRange) {
  if (itemStartPx < previousPx) {
    return itemStartPx
  }
  if (itemEndPx > previousPx + viewportWidthPx) {
    return Math.max(itemEndPx - viewportWidthPx, 0)
  }
  return previousPx
}

type PageSlideRange = {
  viewportWidthPx: number
  itemWidthPx: number
  // 항목 폭 + 항목 사이 간격
  itemPitchPx: number
}

// 다 보이는 항목 수만큼의 이동 거리, 하나도 다 안 보여도 최소 한 칸 이동
function getPageSlideDistance({ viewportWidthPx, itemWidthPx, itemPitchPx }: PageSlideRange) {
  if (itemPitchPx <= 0) {
    return 0
  }
  const gapPx = itemPitchPx - itemWidthPx
  const visibleItemCount = Math.floor((viewportWidthPx + gapPx) / itemPitchPx)
  return Math.max(visibleItemCount, 1) * itemPitchPx
}

export { getPageSlideDistance, getRevealOffset, getSlideOffset }

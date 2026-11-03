export function getSlideOffset(previousPx: number, deltaPx: number, maxPx: number) {
  return Math.min(Math.max(previousPx + deltaPx, 0), maxPx)
}

type RevealRange = {
  previousPx: number
  itemStartPx: number
  itemEndPx: number
  viewportWidthPx: number
}

export function getRevealOffset({
  previousPx,
  itemStartPx,
  itemEndPx,
  viewportWidthPx,
}: RevealRange) {
  if (itemStartPx < previousPx) {
    return itemStartPx
  }
  if (itemEndPx > previousPx + viewportWidthPx) {
    return Math.max(itemEndPx - viewportWidthPx, 0)
  }
  return previousPx
}

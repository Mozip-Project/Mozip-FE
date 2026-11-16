type KeptHeightReleaseInput = {
  scrollY: number
  documentHeight: number
  viewportHeight: number
  // 유지 중인 높이 중 실제 내용보다 남는 높이
  extraHeight: number
}

// 남는 높이를 없애도 지금 스크롤 위치가 최대 스크롤 안이면 해제 가능, 그 전에 없애면 브라우저가 스크롤을 위로 당김
function canReleaseKeptHeight({
  scrollY,
  documentHeight,
  viewportHeight,
  extraHeight,
}: KeptHeightReleaseInput) {
  if (extraHeight <= 0) {
    return false
  }

  const maxScrollAfterRelease = Math.max(0, documentHeight - extraHeight - viewportHeight)

  return scrollY <= maxScrollAfterRelease
}

export { canReleaseKeptHeight }

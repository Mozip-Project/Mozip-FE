// 1~5, 6~10처럼 묶음 단위로 표시해 묶음 안에서는 번호 위치 고정
function getVisiblePages(currentPage: number, totalPages: number, groupSize: number) {
  const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1
  const groupEnd = Math.min(groupStart + groupSize - 1, totalPages)

  return Array.from(
    { length: Math.max(groupEnd - groupStart + 1, 0) },
    (_, index) => groupStart + index,
  )
}

// URL 쿼리 등 외부 값의 범위 밖 페이지 방지, 숫자가 아니면 첫 페이지로 처리
function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.min(Math.max(Math.trunc(page), 1), totalPages)
}

export { clampPage, getVisiblePages }

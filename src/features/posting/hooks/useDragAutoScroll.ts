import { useEffect, type RefObject } from 'react'

const EDGE_ZONE_PX = 120
const MAX_SPEED_PX_PER_SECOND = 1200
const MS_PER_SECOND = 1000
const MAX_FRAME_MS = 50

// 끝에 가까울수록 1에 가까운 값, 위쪽은 음수
function getScrollRatio(pointerY: number, topEdgePx: number, viewportHeight: number) {
  const topZoneEnd = topEdgePx + EDGE_ZONE_PX
  if (pointerY < topZoneEnd) {
    return -Math.min((topZoneEnd - pointerY) / EDGE_ZONE_PX, 1)
  }
  const bottomZoneStart = viewportHeight - EDGE_ZONE_PX
  if (pointerY > bottomZoneStart) {
    return Math.min((pointerY - bottomZoneStart) / EDGE_ZONE_PX, 1)
  }
  return 0
}

// 브라우저 기본 드래그 중 포인터가 화면 위·아래 끝에 가까우면 페이지 스크롤
// topBoundaryRef는 위에 고정된 요소, 있으면 그 아래 끝을 화면 위 끝으로 사용
function useDragAutoScroll(isDragging: boolean, topBoundaryRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!isDragging) {
      return
    }

    let pointerY: number | null = null
    let topEdgePx = 0
    let lastFrameTime: number | null = null
    let frame = requestAnimationFrame(scrollOnFrame)

    function scrollOnFrame(time: number) {
      const elapsedMs = lastFrameTime === null ? 0 : Math.min(time - lastFrameTime, MAX_FRAME_MS)
      lastFrameTime = time
      const ratio = pointerY === null ? 0 : getScrollRatio(pointerY, topEdgePx, window.innerHeight)
      if (ratio !== 0) {
        window.scrollBy(0, (ratio * MAX_SPEED_PX_PER_SECOND * elapsedMs) / MS_PER_SECOND)
      }
      frame = requestAnimationFrame(scrollOnFrame)
    }

    // drag 이벤트는 Firefox에서 좌표가 0이라 dragover 사용
    function handleDragOver(event: DragEvent) {
      pointerY = event.clientY
      topEdgePx = Math.max(topBoundaryRef?.current?.getBoundingClientRect().bottom ?? 0, 0)
    }

    // 포인터가 창 밖으로 나가면 멈춤
    function handleDragLeave(event: DragEvent) {
      if (event.relatedTarget === null) {
        pointerY = null
      }
    }

    document.addEventListener('dragover', handleDragOver, { passive: true })
    document.addEventListener('dragleave', handleDragLeave, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragleave', handleDragLeave)
    }
  }, [isDragging, topBoundaryRef])
}

export { useDragAutoScroll }

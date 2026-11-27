import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDragAutoScroll } from './useDragAutoScroll'

const VIEWPORT_HEIGHT_PX = 800
const FRAME_MS = 16

function dragOver(clientY: number) {
  document.dispatchEvent(new MouseEvent('dragover', { clientY, bubbles: true }))
}

// 호출마다 세로로 스크롤한 거리 기록
function trackScrollBy() {
  const scrolledPx: number[] = []
  vi.spyOn(window, 'scrollBy').mockImplementation((...args: unknown[]) => {
    if (typeof args[1] === 'number') {
      scrolledPx.push(args[1])
    }
  })
  return scrolledPx
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

describe('useDragAutoScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('innerHeight', VIEWPORT_HEIGHT_PX)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('드래그 중 포인터가 화면 아래 끝에 가까우면 아래로 스크롤', () => {
    const scrolledPx = trackScrollBy()
    renderHook(() => useDragAutoScroll(true))

    dragOver(VIEWPORT_HEIGHT_PX - 10)
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(sum(scrolledPx)).toBeGreaterThan(0)
  })

  it('드래그 중 포인터가 화면 위 끝에 가까우면 위로 스크롤', () => {
    const scrolledPx = trackScrollBy()
    renderHook(() => useDragAutoScroll(true))

    dragOver(10)
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(sum(scrolledPx)).toBeLessThan(0)
  })

  it('위에 고정된 요소가 있으면 그 아래 끝부터 위쪽 스크롤 구간', () => {
    const scrolledPx = trackScrollBy()
    const fixedBar = document.createElement('div')
    vi.spyOn(fixedBar, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 0, 200))
    renderHook(() => useDragAutoScroll(true, { current: fixedBar }))

    dragOver(210)
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(sum(scrolledPx)).toBeLessThan(0)
  })

  it('포인터가 화면 가운데면 스크롤하지 않음', () => {
    const scrolledPx = trackScrollBy()
    renderHook(() => useDragAutoScroll(true))

    dragOver(VIEWPORT_HEIGHT_PX / 2)
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(scrolledPx).toHaveLength(0)
  })

  it('드래그가 끝나면 스크롤 멈춤', () => {
    const scrolledPx = trackScrollBy()
    const { rerender } = renderHook(({ isDragging }) => useDragAutoScroll(isDragging), {
      initialProps: { isDragging: true },
    })
    dragOver(VIEWPORT_HEIGHT_PX - 10)
    vi.advanceTimersByTime(FRAME_MS * 5)

    rerender({ isDragging: false })
    scrolledPx.length = 0
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(scrolledPx).toHaveLength(0)
  })

  it('드래그 중이 아니면 화면 끝이어도 스크롤하지 않음', () => {
    const scrolledPx = trackScrollBy()
    renderHook(() => useDragAutoScroll(false))

    dragOver(VIEWPORT_HEIGHT_PX - 10)
    vi.advanceTimersByTime(FRAME_MS * 5)

    expect(scrolledPx).toHaveLength(0)
  })
})

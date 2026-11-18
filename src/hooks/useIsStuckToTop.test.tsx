import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsStuckToTop } from './useIsStuckToTop'

const STICKY_TOP_PX = 48

let elementTopPx = 200
let frameCallbacks: FrameRequestCallback[] = []

function StuckStatus() {
  const ref = useRef<HTMLDivElement>(null)
  const isStuck = useIsStuckToTop(ref, STICKY_TOP_PX)

  return <div ref={ref}>{isStuck ? '고정' : '고정 안 됨'}</div>
}

function flushFrames() {
  act(() => {
    const callbacks = frameCallbacks
    frameCallbacks = []
    callbacks.forEach((callback) => callback(0))
  })
}

function scrollTo(topPx: number) {
  elementTopPx = topPx
  fireEvent.scroll(window)
  flushFrames()
}

describe('useIsStuckToTop', () => {
  beforeEach(() => {
    elementTopPx = 200
    frameCallbacks = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameCallbacks.push(callback)
      return frameCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, elementTopPx, 0, 0),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('처음 위치가 고정 위치보다 아래면 고정 안 됨', () => {
    render(<StuckStatus />)
    flushFrames()

    expect(screen.getByText('고정 안 됨')).toBeInTheDocument()
  })

  it('새로고침처럼 처음부터 고정 위치에 있으면 고정', () => {
    elementTopPx = STICKY_TOP_PX
    render(<StuckStatus />)
    flushFrames()

    expect(screen.getByText('고정')).toBeInTheDocument()
  })

  it('스크롤해 고정 위치에 닿으면 고정, 다시 내려가면 해제', () => {
    render(<StuckStatus />)
    flushFrames()

    scrollTo(STICKY_TOP_PX)
    expect(screen.getByText('고정')).toBeInTheDocument()

    scrollTo(200)
    expect(screen.getByText('고정 안 됨')).toBeInTheDocument()
  })

  it('확대·축소로 생긴 1px 미만 오차는 고정으로 처리', () => {
    render(<StuckStatus />)
    flushFrames()

    scrollTo(STICKY_TOP_PX + 0.4)
    expect(screen.getByText('고정')).toBeInTheDocument()

    scrollTo(STICKY_TOP_PX + 1)
    expect(screen.getByText('고정 안 됨')).toBeInTheDocument()
  })

  it('스크롤 없이 top 전환이 끝나도 위치 다시 확인', () => {
    render(<StuckStatus />)
    flushFrames()

    elementTopPx = STICKY_TOP_PX
    fireEvent.transitionEnd(screen.getByText('고정 안 됨'))
    flushFrames()

    expect(screen.getByText('고정')).toBeInTheDocument()
  })

  it('한 프레임 안의 여러 스크롤은 한 번만 측정', () => {
    render(<StuckStatus />)
    flushFrames()

    fireEvent.scroll(window)
    fireEvent.scroll(window)

    expect(frameCallbacks).toHaveLength(1)
  })

  it('언마운트하면 스크롤 감지 해제', () => {
    const { unmount } = render(<StuckStatus />)
    flushFrames()

    unmount()
    fireEvent.scroll(window)

    expect(frameCallbacks).toHaveLength(0)
  })
})

import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsStuckToTop } from './useIsStuckToTop'

const STICKY_TOP_PX = 48
const ROOT_TOP_PX = STICKY_TOP_PX + 1

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

let observerCallback: ObserverCallback | undefined
let observerOptions: IntersectionObserverInit | undefined
const disconnect = vi.fn()

class MockIntersectionObserver {
  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    observerCallback = callback
    observerOptions = options
  }

  observe() {}

  disconnect() {
    disconnect()
  }
}

function StuckStatus() {
  const ref = useRef<HTMLDivElement>(null)
  const isStuck = useIsStuckToTop(ref, STICKY_TOP_PX)

  return <div ref={ref}>{isStuck ? '고정' : '고정 안 됨'}</div>
}

type Observation = { top: number; intersectionRatio: number }

function toEntry({ top, intersectionRatio }: Observation): Partial<IntersectionObserverEntry> {
  return {
    intersectionRatio,
    boundingClientRect: { top } as DOMRectReadOnly,
    rootBounds: { top: ROOT_TOP_PX } as DOMRectReadOnly,
  }
}

function reportElement(...observations: Observation[]) {
  act(() => {
    observerCallback?.(observations.map(toEntry))
  })
}

describe('useIsStuckToTop', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    disconnect.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    observerCallback = undefined
    observerOptions = undefined
  })

  it('고정 위치보다 1px 더 관찰 영역 위쪽을 줄임', () => {
    render(<StuckStatus />)

    expect(observerOptions?.rootMargin).toBe(`-${ROOT_TOP_PX}px 0px 0px 0px`)
    expect(observerOptions?.threshold).toBe(1)
  })

  it('고정 위치에 붙어 위쪽이 관찰 영역 밖이면 고정', () => {
    render(<StuckStatus />)

    reportElement({ top: STICKY_TOP_PX, intersectionRatio: 0.98 })

    expect(screen.getByText('고정')).toBeInTheDocument()
  })

  it('전부 관찰 영역 안이면 고정 안 됨', () => {
    render(<StuckStatus />)

    reportElement({ top: STICKY_TOP_PX, intersectionRatio: 0.98 })
    reportElement({ top: 200, intersectionRatio: 1 })

    expect(screen.getByText('고정 안 됨')).toBeInTheDocument()
  })

  it('화면 아래쪽에 걸쳐 잘린 경우는 고정 안 됨', () => {
    render(<StuckStatus />)

    reportElement({ top: 900, intersectionRatio: 0.5 })

    expect(screen.getByText('고정 안 됨')).toBeInTheDocument()
  })

  it('여러 관측값이 한 번에 오면 마지막 값 기준', () => {
    render(<StuckStatus />)

    reportElement(
      { top: 200, intersectionRatio: 1 },
      { top: STICKY_TOP_PX, intersectionRatio: 0.98 },
    )

    expect(screen.getByText('고정')).toBeInTheDocument()
  })

  it('언마운트하면 관찰 해제', () => {
    const { unmount } = render(<StuckStatus />)

    unmount()

    expect(disconnect).toHaveBeenCalledOnce()
  })
})

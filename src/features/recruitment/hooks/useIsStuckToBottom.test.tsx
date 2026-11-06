import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsStuckToBottom } from './useIsStuckToBottom'

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

const ROOT_BOTTOM = 779

let notify: ObserverCallback
let observerOptions: IntersectionObserverInit | undefined
const disconnect = vi.fn()

function Bar() {
  const { ref, isStuck } = useIsStuckToBottom<HTMLDivElement>(20)

  return <div ref={ref}>{isStuck ? '고정' : '제자리'}</div>
}

function notifyBar(intersectionRatio: number, elementBottom: number) {
  act(() => {
    notify([
      {
        intersectionRatio,
        boundingClientRect: { bottom: elementBottom } as DOMRectReadOnly,
        rootBounds: { bottom: ROOT_BOTTOM } as DOMRectReadOnly,
      },
    ])
  })
}

describe('useIsStuckToBottom', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
          notify = callback
          observerOptions = options
        }
        observe = vi.fn()
        disconnect = disconnect
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    disconnect.mockClear()
  })

  it('바닥 간격보다 1px 더 줄인 영역으로 감지', () => {
    render(<Bar />)

    expect(observerOptions).toMatchObject({ rootMargin: '0px 0px -21px 0px', threshold: 1 })
  })

  it('요소가 감지 영역 아래로 걸치면 고정, 영역 안으로 들어오면 제자리', () => {
    render(<Bar />)

    notifyBar(0.99, ROOT_BOTTOM + 1)
    expect(screen.getByText('고정')).toBeInTheDocument()

    notifyBar(1, ROOT_BOTTOM - 40)
    expect(screen.getByText('제자리')).toBeInTheDocument()
  })

  it('화면 위로 벗어난 요소는 고정으로 보지 않음', () => {
    render(<Bar />)

    notifyBar(0.5, 40)

    expect(screen.getByText('제자리')).toBeInTheDocument()
  })

  it('언마운트 시 관찰 해제', () => {
    const { unmount } = render(<Bar />)

    unmount()

    expect(disconnect).toHaveBeenCalled()
  })
})

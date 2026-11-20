import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInViewTrigger } from './useInViewTrigger'

type ObserverRecord = {
  callback: IntersectionObserverCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}

let observers: ObserverRecord[] = []

function emitIntersection(record: ObserverRecord | undefined, isIntersecting: boolean) {
  if (!record) {
    throw new Error('관찰 중인 observer가 없습니다.')
  }
  const entry = { isIntersecting } as IntersectionObserverEntry
  record.callback([entry], {} as IntersectionObserver)
}

type SentinelProps = {
  onInView: () => void
  isEnabled: boolean
  // 바뀌면 대상 요소를 새로 그림, 탭 전환으로 목록이 새로 그려지는 상황 재현
  targetKey?: string
}

function Sentinel({ onInView, isEnabled, targetKey = 'first' }: SentinelProps) {
  const targetRef = useInViewTrigger<HTMLDivElement>(onInView, isEnabled)
  return <div key={targetKey} data-testid={targetKey} ref={targetRef} />
}

beforeEach(() => {
  observers = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()

      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, observe: this.observe, disconnect: this.disconnect })
      }
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useInViewTrigger', () => {
  it('대상이 보이면 onInView를 실행하고, 보이지 않으면 실행하지 않는다', () => {
    const onInView = vi.fn()
    render(<Sentinel onInView={onInView} isEnabled />)

    emitIntersection(observers.at(-1), false)
    expect(onInView).not.toHaveBeenCalled()

    emitIntersection(observers.at(-1), true)
    expect(onInView).toHaveBeenCalledTimes(1)
  })

  it('비활성 상태에서는 관찰하지 않는다', () => {
    render(<Sentinel onInView={vi.fn()} isEnabled={false} />)

    expect(observers).toHaveLength(0)
  })

  it('다시 활성화되면 새로 관찰하고, 이전 관찰과 언마운트 시 관찰을 해제한다', () => {
    const { rerender, unmount } = render(<Sentinel onInView={vi.fn()} isEnabled />)
    const first = observers.at(-1)

    rerender(<Sentinel onInView={vi.fn()} isEnabled={false} />)
    expect(first?.disconnect).toHaveBeenCalled()

    rerender(<Sentinel onInView={vi.fn()} isEnabled />)
    const second = observers.at(-1)
    expect(second).not.toBe(first)
    expect(second?.observe).toHaveBeenCalled()

    unmount()
    expect(second?.disconnect).toHaveBeenCalled()
  })

  it('활성 상태에서 대상 요소가 새로 그려지면 새 요소를 관찰한다', () => {
    const { rerender, getByTestId } = render(<Sentinel onInView={vi.fn()} isEnabled />)
    const first = observers.at(-1)

    rerender(<Sentinel onInView={vi.fn()} isEnabled targetKey="second" />)
    const second = observers.at(-1)

    expect(first?.disconnect).toHaveBeenCalled()
    expect(second).not.toBe(first)
    expect(second?.observe).toHaveBeenCalledWith(getByTestId('second'))
  })

  it('마지막으로 받은 onInView를 실행한다', () => {
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(<Sentinel onInView={first} isEnabled />)

    rerender(<Sentinel onInView={latest} isEnabled />)
    emitIntersection(observers.at(-1), true)

    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledTimes(1)
  })
})

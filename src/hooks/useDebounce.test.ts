import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

const DELAY_MS = 300

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('지연 시간이 지나야 실행', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(DELAY_MS))

    act(() => result.current.schedule(callback))
    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(callback).toHaveBeenCalledOnce()
  })

  it('다시 예약하면 이전 예약은 버리고 마지막만 실행', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result } = renderHook(() => useDebounce(DELAY_MS))

    act(() => result.current.schedule(first))
    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })
    act(() => result.current.schedule(second))
    act(() => {
      vi.advanceTimersByTime(DELAY_MS)
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('취소하면 실행하지 않음', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebounce(DELAY_MS))

    act(() => result.current.schedule(callback))
    act(() => result.current.cancel())
    act(() => {
      vi.advanceTimersByTime(DELAY_MS)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('언마운트되면 대기 중인 실행 취소', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebounce(DELAY_MS))

    act(() => result.current.schedule(callback))
    unmount()
    act(() => {
      vi.advanceTimersByTime(DELAY_MS)
    })

    expect(callback).not.toHaveBeenCalled()
  })
})

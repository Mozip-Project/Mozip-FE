import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('시작 전에는 0초, 진행·만료 아님', () => {
    const { result } = renderHook(() => useCountdown())

    expect(result.current).toMatchObject({
      remainingSeconds: 0,
      isRunning: false,
      isExpired: false,
    })
  })

  it('시작하면 1초마다 남은 시간 감소', () => {
    const { result } = renderHook(() => useCountdown())

    act(() => result.current.start(180))
    expect(result.current.remainingSeconds).toBe(180)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.remainingSeconds).toBe(179)
  })

  it('시간이 다 되면 0초에서 멈추고 만료 표시', () => {
    const { result } = renderHook(() => useCountdown())

    act(() => result.current.start(2))
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toMatchObject({ remainingSeconds: 0, isRunning: false, isExpired: true })
  })

  it('다시 시작하면 처음 시간부터 다시 셈', () => {
    const { result } = renderHook(() => useCountdown())

    act(() => result.current.start(3))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => result.current.start(3))

    expect(result.current.remainingSeconds).toBe(3)
  })

  it('멈추면 시작 전 상태로 돌아감', () => {
    const { result } = renderHook(() => useCountdown())

    act(() => result.current.start(3))
    act(() => result.current.stop())
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current).toMatchObject({
      remainingSeconds: 0,
      isRunning: false,
      isExpired: false,
    })
  })
})

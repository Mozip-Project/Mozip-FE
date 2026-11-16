import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollWithoutRevealing, useHideOnScrollDown } from './useHideOnScrollDown'

const ALWAYS_VISIBLE_UNTIL_PX = 64

function scrollTo(scrollY: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useHideOnScrollDown', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.restoreAllMocks()
  })

  it('처음에는 표시', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    expect(result.current.isHidden).toBe(false)
  })

  it('상단 구간을 넘어 아래로 스크롤하면 숨김', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(ALWAYS_VISIBLE_UNTIL_PX + 100)

    expect(result.current.isHidden).toBe(true)
  })

  it('상단 구간 안에서는 아래로 스크롤해도 표시', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(ALWAYS_VISIBLE_UNTIL_PX)

    expect(result.current.isHidden).toBe(false)
  })

  it('숨긴 뒤 조금이라도 위로 스크롤하면 바로 표시', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(500)
    scrollTo(499)

    expect(result.current.isHidden).toBe(false)
  })

  it('canHide가 false면 아래로 스크롤해도 표시', () => {
    const { result } = renderHook(() =>
      useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX, { canHide: () => false }),
    )

    scrollTo(500)

    expect(result.current.isHidden).toBe(false)
  })

  it('숨긴 상태에서 reveal을 부르면 표시', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(500)
    act(() => result.current.reveal())

    expect(result.current.isHidden).toBe(false)
    expect(result.current.isRevealed).toBe(true)
  })

  it('처음과 상단 구간 안에서는 다시 나온 상태가 아님', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    expect(result.current.isRevealed).toBe(false)

    scrollTo(30)

    expect(result.current.isRevealed).toBe(false)
  })

  it('숨긴 뒤 위로 스크롤하면 다시 나온 상태', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(500)
    scrollTo(400)

    expect(result.current.isRevealed).toBe(true)
  })

  it('다시 나온 상태는 상단 구간에 들어와도 유지하고 맨 위에 닿으면 해제', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(500)
    scrollTo(400)
    scrollTo(30)

    expect(result.current.isRevealed).toBe(true)

    scrollTo(0)

    expect(result.current.isRevealed).toBe(false)
  })

  it('숨긴 상태에서 바로 상단 구간으로 올라와도 다시 나온 상태', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    scrollTo(500)
    scrollTo(30)

    expect(result.current.isHidden).toBe(false)
    expect(result.current.isRevealed).toBe(true)
  })

  it('scrollWithoutRevealing으로 위로 이동하면 숨긴 상태 유지', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))
    const animationFrames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    const PROGRAMMATIC_TOP_PX = 300
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => scrollTo(PROGRAMMATIC_TOP_PX))

    scrollTo(500)
    scrollWithoutRevealing(PROGRAMMATIC_TOP_PX)

    expect(scrollToSpy).toHaveBeenCalledWith({ top: PROGRAMMATIC_TOP_PX, behavior: 'instant' })

    expect(result.current.isHidden).toBe(true)

    // 다음 화면 갱신 뒤에는 사용자 스크롤에 다시 반응
    act(() => animationFrames.forEach((callback) => callback(0)))
    scrollTo(299)

    expect(result.current.isHidden).toBe(false)
  })

  // 접기처럼 내용이 줄어 브라우저가 먼저 목표 위치로 스크롤을 당긴 경우
  it('이미 목표 위치여도 이어지는 scroll 이벤트에 숨긴 상태 유지', () => {
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))
    const animationFrames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const CLAMPED_TOP_PX = 300

    scrollTo(500)
    Object.defineProperty(window, 'scrollY', { value: CLAMPED_TOP_PX, configurable: true })
    scrollWithoutRevealing(CLAMPED_TOP_PX)
    scrollTo(CLAMPED_TOP_PX)

    expect(scrollToSpy).not.toHaveBeenCalled()
    expect(result.current.isHidden).toBe(true)

    // 모듈 표시가 다음 테스트로 넘어가지 않게 화면 갱신 처리
    act(() => animationFrames.forEach((callback) => callback(0)))
  })

  it('중간 위치에서 시작하면 다시 나온 상태', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })

    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))

    expect(result.current.isHidden).toBe(false)
    expect(result.current.isRevealed).toBe(true)
  })

  it('scrollWithoutRevealing으로 상단 구간에 닿으면 표시', () => {
    const animationFrames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    const { result } = renderHook(() => useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX))
    const TOP_ZONE_PX = 30
    vi.spyOn(window, 'scrollTo').mockImplementation(() => scrollTo(TOP_ZONE_PX))

    scrollTo(500)
    scrollWithoutRevealing(TOP_ZONE_PX)

    expect(result.current.isHidden).toBe(false)
    expect(result.current.isRevealed).toBe(true)

    // 모듈 표시가 다음 테스트로 넘어가지 않게 화면 갱신 처리
    act(() => animationFrames.forEach((callback) => callback(0)))
  })

  it('canHide가 false면 아래로 스크롤할 때 다시 나온 상태로 유지', () => {
    const { result } = renderHook(() =>
      useHideOnScrollDown(ALWAYS_VISIBLE_UNTIL_PX, { canHide: () => false }),
    )

    scrollTo(500)

    expect(result.current.isRevealed).toBe(true)
  })
})

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoSave, type SaveTrigger } from './useAutoSave'

const DELAY_MS = 3000

function renderAutoSave(onSave: (trigger: SaveTrigger) => Promise<void>) {
  return renderHook(() => useAutoSave(DELAY_MS, onSave))
}

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('여러 번 예약해도 마지막 예약 뒤 한 번만 자동 저장', async () => {
    const onSave = vi.fn(() => Promise.resolve())
    const { result } = renderAutoSave(onSave)

    act(() => result.current.scheduleSave())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS - 1))
    act(() => result.current.scheduleSave())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS - 1))
    expect(onSave).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(onSave).toHaveBeenCalledExactlyOnceWith('auto')
  })

  it('바로 저장하면 대기 중인 자동 저장 대신 수동 저장', async () => {
    const onSave = vi.fn(() => Promise.resolve())
    const { result } = renderAutoSave(onSave)

    act(() => result.current.scheduleSave())
    await act(() => result.current.saveNow())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS))

    expect(onSave).toHaveBeenCalledExactlyOnceWith('manual')
  })

  it('저장 중 들어온 요청은 겹치지 않고 끝난 뒤 한 번 더 저장', async () => {
    let finishFirstSave = () => {}
    const onSave = vi
      .fn<(trigger: SaveTrigger) => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirstSave = resolve
          }),
      )
      .mockResolvedValue(undefined)
    const { result } = renderAutoSave(onSave)

    act(() => result.current.scheduleSave())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS))
    act(() => result.current.scheduleSave())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS))
    await act(() => result.current.saveNow())
    expect(onSave).toHaveBeenCalledTimes(1)

    await act(async () => {
      finishFirstSave()
      await Promise.resolve()
    })
    expect(onSave).toHaveBeenCalledTimes(2)
    expect(onSave).toHaveBeenLastCalledWith('manual')
  })

  it('보낸 저장이 끝날 때까지 대기, 저장 중이 아니면 바로 끝남', async () => {
    let finishSave = () => {}
    const onSave = vi.fn<(trigger: SaveTrigger) => Promise<void>>(
      () =>
        new Promise((resolve) => {
          finishSave = resolve
        }),
    )
    const { result } = renderAutoSave(onSave)
    await expect(result.current.waitForSave()).resolves.toBeUndefined()

    act(() => void result.current.saveNow())
    let isWaitDone = false
    const waiting = result.current.waitForSave().then(() => {
      isWaitDone = true
    })
    await act(() => Promise.resolve())
    expect(isWaitDone).toBe(false)

    await act(async () => {
      finishSave()
      await waiting
    })
    expect(isWaitDone).toBe(true)
  })

  it('저장이 실패해도 대기는 실패 없이 끝남', async () => {
    let failSave = () => {}
    const onSave = vi.fn<(trigger: SaveTrigger) => Promise<void>>(
      () =>
        new Promise((_resolve, reject) => {
          failSave = () => reject(new Error('save failed'))
        }),
    )
    const { result } = renderAutoSave(onSave)

    let saving: Promise<void> = Promise.resolve()
    act(() => {
      saving = result.current.saveNow().catch(() => undefined)
    })
    const waiting = result.current.waitForSave()

    await act(async () => {
      failSave()
      await saving
    })
    await expect(waiting).resolves.toBeUndefined()
  })

  it('저장 중 언마운트하면 대기 중인 저장은 실행하지 않음', async () => {
    let finishSave = () => {}
    const onSave = vi
      .fn<(trigger: SaveTrigger) => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishSave = resolve
          }),
      )
      .mockResolvedValue(undefined)
    const { result, unmount } = renderAutoSave(onSave)

    act(() => void result.current.saveNow())
    act(() => void result.current.saveNow())
    unmount()

    await act(async () => {
      finishSave()
      await Promise.resolve()
    })
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('예약을 취소하면 자동 저장하지 않음', async () => {
    const onSave = vi.fn(() => Promise.resolve())
    const { result } = renderAutoSave(onSave)

    act(() => result.current.scheduleSave())
    act(() => result.current.cancelScheduledSave())
    await act(() => vi.advanceTimersByTimeAsync(DELAY_MS))

    expect(onSave).not.toHaveBeenCalled()
  })
})

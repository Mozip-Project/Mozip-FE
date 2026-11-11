import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedSearch } from './useDebouncedSearch'

const DEBOUNCE_MS = 300

function renderSearch(initialKeyword = '') {
  const onSearch = vi.fn()
  const hook = renderHook(({ appliedKeyword }) => useDebouncedSearch(appliedKeyword, onSearch), {
    initialProps: { appliedKeyword: initialKeyword },
  })

  return { ...hook, onSearch }
}

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('입력 중 글자를 바로 보여 주고 입력을 멈춘 뒤 검색', () => {
    const { result, onSearch } = renderSearch()

    act(() => result.current.changeKeyword('UX'))
    expect(result.current.keyword).toBe('UX')
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS)
    })
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('UX')
  })

  it('검색어를 모두 지우면 기다리지 않고 바로 검색', () => {
    const { result, onSearch } = renderSearch('UX')

    act(() => result.current.changeKeyword('U'))
    act(() => result.current.changeKeyword(''))

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('')
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS)
    })
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it('대기 중인 검색을 취소하면 실행하지 않음', () => {
    const { result, onSearch } = renderSearch()

    act(() => result.current.changeKeyword('UX'))
    act(() => result.current.cancelPendingSearch())
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS)
    })

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('검색어가 반영되면 이후에는 반영된 값을 따름', () => {
    const { result, rerender } = renderSearch()

    act(() => result.current.changeKeyword('UX'))
    rerender({ appliedKeyword: 'UX' })
    rerender({ appliedKeyword: '디자인' })

    expect(result.current.keyword).toBe('디자인')
  })

  it('뒤로·앞으로 가기를 하면 대기 중인 검색을 취소하고 반영된 값으로 되돌림', () => {
    const { result, onSearch } = renderSearch()

    act(() => result.current.changeKeyword('UX'))
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS)
    })

    expect(onSearch).not.toHaveBeenCalled()
    expect(result.current.keyword).toBe('')
  })
})

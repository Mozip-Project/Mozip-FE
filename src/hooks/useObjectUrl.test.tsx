import { renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useObjectUrl } from './useObjectUrl'

let created: string[] = []
let revoked: string[] = []

function strictWrapper({ children }: { children: ReactNode }) {
  return <StrictMode>{children}</StrictMode>
}

describe('useObjectUrl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    created = []
    revoked = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      const url = `blob:${created.length}`
      created.push(url)
      return url
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
      revoked.push(url)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('파일이 있는 채로 처음 그려져도 StrictMode 재실행 뒤 URL 유지', () => {
    const file = new File(['image'], 'main.png', { type: 'image/png' })
    const { result } = renderHook(() => useObjectUrl(file), { wrapper: strictWrapper })

    vi.runAllTimers()
    expect(result.current).toBe('blob:0')
    expect(revoked).toEqual([])
  })

  it('같은 파일을 여러 화면에서 쓰면 URL 하나를 공유하고 모두 사라진 뒤 해제', () => {
    const file = new File(['image'], 'main.png', { type: 'image/png' })
    const first = renderHook(() => useObjectUrl(file))
    const second = renderHook(() => useObjectUrl(file))

    expect(second.result.current).toBe(first.result.current)
    first.unmount()
    vi.runAllTimers()
    expect(revoked).toEqual([])

    second.unmount()
    vi.runAllTimers()
    expect(revoked).toEqual(['blob:0'])
  })

  it('파일이 바뀌면 이전 URL 해제, 파일이 없으면 null', () => {
    const first = new File(['a'], 'a.png', { type: 'image/png' })
    const second = new File(['b'], 'b.png', { type: 'image/png' })
    const { result, rerender } = renderHook<string | null, { file: Blob | null }>(
      ({ file }) => useObjectUrl(file),
      { initialProps: { file: first } },
    )

    rerender({ file: second })
    vi.runAllTimers()
    expect(result.current).toBe('blob:1')
    expect(revoked).toEqual(['blob:0'])

    rerender({ file: null })
    vi.runAllTimers()
    expect(result.current).toBeNull()
    expect(revoked).toEqual(['blob:0', 'blob:1'])
  })
})

import { act, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStickyTopBarHeight } from './useStickyTopBarHeight'

const HEIGHT_VAR = '--sticky-top-bar-height'

let resizeCallbacks: (() => void)[] = []
let barHeightPx = 180

function StickyBar() {
  const ref = useRef<HTMLDivElement>(null)
  useStickyTopBarHeight(ref)

  return <div ref={ref} />
}

function resize(heightPx: number) {
  barHeightPx = heightPx
  act(() => {
    resizeCallbacks.forEach((callback) => callback())
  })
}

describe('useStickyTopBarHeight', () => {
  beforeEach(() => {
    resizeCallbacks = []
    barHeightPx = 180
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private callback: () => void) {}
        observe() {
          resizeCallbacks.push(this.callback)
          this.callback()
        }
        disconnect() {
          resizeCallbacks = resizeCallbacks.filter((callback) => callback !== this.callback)
        }
      },
    )
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => barHeightPx)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.documentElement.style.removeProperty(HEIGHT_VAR)
  })

  it('바 높이를 html 변수로 반영하고 크기가 바뀌면 갱신', () => {
    render(<StickyBar />)
    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('180px')

    resize(220)
    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('220px')
  })

  it('화면을 벗어나면 변수를 지워 기본값으로 복귀', () => {
    const { unmount } = render(<StickyBar />)

    unmount()
    expect(document.documentElement.style.getPropertyValue(HEIGHT_VAR)).toBe('')
  })
})

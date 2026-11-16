import { describe, expect, it } from 'vitest'
import { canReleaseKeptHeight } from './keptHeight'

const VIEWPORT_HEIGHT = 800

describe('canReleaseKeptHeight', () => {
  it('남는 높이가 없으면 해제하지 않음', () => {
    expect(
      canReleaseKeptHeight({
        scrollY: 0,
        documentHeight: 2000,
        viewportHeight: VIEWPORT_HEIGHT,
        extraHeight: 0,
      }),
    ).toBe(false)
  })

  it('없애면 지금 위치보다 최대 스크롤이 작아지는 동안은 유지', () => {
    expect(
      canReleaseKeptHeight({
        scrollY: 900,
        documentHeight: 2000,
        viewportHeight: VIEWPORT_HEIGHT,
        extraHeight: 600,
      }),
    ).toBe(false)
  })

  it('위로 스크롤해 남는 높이가 화면 아래로 벗어나면 해제', () => {
    expect(
      canReleaseKeptHeight({
        scrollY: 600,
        documentHeight: 2000,
        viewportHeight: VIEWPORT_HEIGHT,
        extraHeight: 600,
      }),
    ).toBe(true)
  })

  it('없앤 뒤 문서가 화면보다 짧아지면 맨 위에서만 해제', () => {
    const input = { documentHeight: 1200, viewportHeight: VIEWPORT_HEIGHT, extraHeight: 600 }

    expect(canReleaseKeptHeight({ ...input, scrollY: 100 })).toBe(false)
    expect(canReleaseKeptHeight({ ...input, scrollY: 0 })).toBe(true)
  })
})

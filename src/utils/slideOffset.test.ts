import { describe, expect, it } from 'vitest'
import { getRevealOffset, getSlideOffset } from './slideOffset'

describe('getSlideOffset', () => {
  it('이전 목표 위치에 이동량을 누적', () => {
    expect(getSlideOffset(208, 208, 1000)).toBe(416)
  })

  it('시작보다 앞으로 가지 않음', () => {
    expect(getSlideOffset(100, -208, 1000)).toBe(0)
  })

  it('끝을 넘지 않음', () => {
    expect(getSlideOffset(900, 208, 1000)).toBe(1000)
  })
})

describe('getRevealOffset', () => {
  const viewportWidthPx = 600

  it('왼쪽에 가려진 항목은 시작점에 맞춤', () => {
    expect(
      getRevealOffset({ previousPx: 400, itemStartPx: 208, itemEndPx: 408, viewportWidthPx }),
    ).toBe(208)
  })

  it('오른쪽에 가려진 항목은 끝점에 맞춤', () => {
    expect(
      getRevealOffset({ previousPx: 0, itemStartPx: 624, itemEndPx: 824, viewportWidthPx }),
    ).toBe(224)
  })

  it('이미 보이는 항목은 위치 유지', () => {
    expect(
      getRevealOffset({ previousPx: 208, itemStartPx: 416, itemEndPx: 616, viewportWidthPx }),
    ).toBe(208)
  })
})

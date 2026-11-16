import { describe, expect, it } from 'vitest'
import { getPageSlideDistance, getRevealOffset, getSlideOffset } from './slideOffset'

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

describe('getPageSlideDistance', () => {
  const itemWidthPx = 200
  const itemPitchPx = 208

  it('다 보이는 항목 수만큼 이동', () => {
    expect(getPageSlideDistance({ viewportWidthPx: 900, itemWidthPx, itemPitchPx })).toBe(832)
  })

  it('마지막 항목 뒤 간격은 없어도 다 보이는 것으로 계산', () => {
    expect(getPageSlideDistance({ viewportWidthPx: 824, itemWidthPx, itemPitchPx })).toBe(832)
  })

  it('일부만 보이는 항목은 개수에서 제외', () => {
    expect(getPageSlideDistance({ viewportWidthPx: 823, itemWidthPx, itemPitchPx })).toBe(624)
  })

  it('항목 하나도 다 보이지 않으면 한 칸 이동', () => {
    expect(getPageSlideDistance({ viewportWidthPx: 150, itemWidthPx, itemPitchPx })).toBe(208)
  })

  it('항목 간격을 알 수 없으면 이동하지 않음', () => {
    expect(getPageSlideDistance({ viewportWidthPx: 900, itemWidthPx, itemPitchPx: 0 })).toBe(0)
  })
})

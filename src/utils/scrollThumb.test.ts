import { describe, expect, it } from 'vitest'
import { getScrollThumb } from './scrollThumb'

describe('getScrollThumb', () => {
  it('넘치지 않으면 막대 없이 끝 상태', () => {
    expect(getScrollThumb({ scrollLeft: 0, scrollWidth: 810, clientWidth: 810 })).toEqual({
      hasOverflow: false,
      isAtStart: true,
      isAtEnd: true,
      sizeRatio: 1,
      offsetRatio: 0,
    })
  })

  it('처음에는 막대가 왼쪽, 보이는 비율만큼 길이', () => {
    expect(getScrollThumb({ scrollLeft: 0, scrollWidth: 1620, clientWidth: 810 })).toEqual({
      hasOverflow: true,
      isAtStart: true,
      isAtEnd: false,
      sizeRatio: 0.5,
      offsetRatio: 0,
    })
  })

  it('끝까지 스크롤하면 막대가 오른쪽 끝, 1px 미만 차이도 끝으로 판단', () => {
    expect(getScrollThumb({ scrollLeft: 810, scrollWidth: 1620, clientWidth: 810 })).toMatchObject({
      isAtStart: false,
      isAtEnd: true,
      offsetRatio: 0.5,
    })
    expect(getScrollThumb({ scrollLeft: 809.5, scrollWidth: 1620, clientWidth: 810 }).isAtEnd).toBe(
      true,
    )
  })

  it('범위를 벗어난 스크롤 값은 양 끝으로 보정', () => {
    expect(
      getScrollThumb({ scrollLeft: -20, scrollWidth: 1620, clientWidth: 810 }).offsetRatio,
    ).toBe(0)
    expect(
      getScrollThumb({ scrollLeft: 2000, scrollWidth: 1620, clientWidth: 810 }).offsetRatio,
    ).toBe(0.5)
  })
})

import { describe, expect, it } from 'vitest'
import { getDropIndex } from './dropIndex'

// 높이 100인 항목 3개가 간격 20을 두고 쌓인 목록의 가운데 높이
const ITEM_CENTERS = [50, 170, 290]

describe('getDropIndex', () => {
  it.each([
    [0, 0],
    [50, 0],
    [51, 1],
    [110, 1],
    [170, 1],
    [230, 2],
    [290, 2],
    [291, 3],
    [500, 3],
  ])('포인터 높이 %i이면 %i번 자리에 놓음', (pointerY, expected) => {
    expect(getDropIndex(ITEM_CENTERS, pointerY)).toBe(expected)
  })

  it('항목이 없으면 0번 자리', () => {
    expect(getDropIndex([], 100)).toBe(0)
  })
})

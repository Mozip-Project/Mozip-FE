import { describe, expect, it } from 'vitest'
import { toggleInOrder } from './toggleInOrder'

const ORDER = ['a', 'b', 'c'] as const

describe('toggleInOrder', () => {
  it('켠 항목은 선택 순서와 무관하게 기준 순서로 추가', () => {
    expect(toggleInOrder(ORDER, ['c'], 'a', true)).toEqual(['a', 'c'])
  })

  it('끈 항목만 제거', () => {
    expect(toggleInOrder(ORDER, ['a', 'b', 'c'], 'b', false)).toEqual(['a', 'c'])
  })
})

import { describe, expect, it } from 'vitest'
import { clampNumber } from './number'

describe('clampNumber', () => {
  const range = { min: 1, max: 10 }

  it('범위 안의 값은 그대로', () => {
    expect(clampNumber(3, range)).toBe(3)
    expect(clampNumber(1, range)).toBe(1)
    expect(clampNumber(10, range)).toBe(10)
  })

  it('범위를 벗어나면 가까운 경계값', () => {
    expect(clampNumber(0, range)).toBe(1)
    expect(clampNumber(11, range)).toBe(10)
  })
})

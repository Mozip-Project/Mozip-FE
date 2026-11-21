import { describe, expect, it } from 'vitest'
import { canMoveToStep, type StepNavigationState } from './stepNavigation'

const ALL_COMPLETE = {
  currentIndex: 1,
  furthestIndex: 3,
  isStepComplete: () => true,
} satisfies StepNavigationState

describe('canMoveToStep', () => {
  it('현재 단계는 이동 불가', () => {
    expect(canMoveToStep(1, ALL_COMPLETE)).toBe(false)
  })

  it('지나온 단계와 다녀온 앞 단계는 이동 가능', () => {
    expect(canMoveToStep(0, ALL_COMPLETE)).toBe(true)
    expect(canMoveToStep(3, ALL_COMPLETE)).toBe(true)
  })

  it('아직 가 보지 않은 단계는 이동 불가', () => {
    expect(canMoveToStep(4, ALL_COMPLETE)).toBe(false)
  })

  it('앞 단계 중 하나라도 조건을 통과하지 못하면 그 뒤 단계는 이동 불가', () => {
    const state = { ...ALL_COMPLETE, isStepComplete: (index: number) => index !== 2 }

    expect(canMoveToStep(2, state)).toBe(true)
    expect(canMoveToStep(3, state)).toBe(false)
  })
})

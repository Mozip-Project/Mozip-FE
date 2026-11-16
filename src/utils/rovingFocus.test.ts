import { describe, expect, it } from 'vitest'
import { getRovingFocusIntent, getRovingFocusTargetIndex } from './rovingFocus'

describe('getRovingFocusIntent', () => {
  it('가로 방향 키와 처음·끝 키를 이동 방향으로 변환', () => {
    expect(getRovingFocusIntent('ArrowLeft')).toBe('prev')
    expect(getRovingFocusIntent('ArrowRight')).toBe('next')
    expect(getRovingFocusIntent('Home')).toBe('first')
    expect(getRovingFocusIntent('PageDown')).toBe('last')
  })

  it('세로 방향 키와 그 밖의 키는 처리하지 않음', () => {
    expect(getRovingFocusIntent('ArrowDown')).toBeUndefined()
    expect(getRovingFocusIntent('Enter')).toBeUndefined()
    expect(getRovingFocusIntent('toString')).toBeUndefined()
  })
})

describe('getRovingFocusTargetIndex', () => {
  it('이전·다음은 한 칸씩 이동', () => {
    expect(getRovingFocusTargetIndex('prev', 2, 4)).toBe(1)
    expect(getRovingFocusTargetIndex('next', 1, 4)).toBe(2)
  })

  it('처음·끝을 넘으면 반대쪽으로 순환', () => {
    expect(getRovingFocusTargetIndex('prev', 0, 4)).toBe(3)
    expect(getRovingFocusTargetIndex('next', 3, 4)).toBe(0)
  })

  it('처음·끝 키는 위치와 관계없이 양 끝으로 이동', () => {
    expect(getRovingFocusTargetIndex('first', 2, 4)).toBe(0)
    expect(getRovingFocusTargetIndex('last', 0, 4)).toBe(3)
  })
})

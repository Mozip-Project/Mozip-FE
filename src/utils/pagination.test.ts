import { describe, expect, it } from 'vitest'
import { clampPage, getVisiblePages } from './pagination'

const GROUP_SIZE = 5

describe('getVisiblePages', () => {
  it('전체 페이지가 묶음 크기 이하면 모두 보여 준다', () => {
    expect(getVisiblePages(1, 3, GROUP_SIZE)).toEqual([1, 2, 3])
    expect(getVisiblePages(5, 5, GROUP_SIZE)).toEqual([1, 2, 3, 4, 5])
  })

  it('같은 묶음 안에서는 번호가 바뀌지 않는다', () => {
    expect(getVisiblePages(1, 12, GROUP_SIZE)).toEqual([1, 2, 3, 4, 5])
    expect(getVisiblePages(4, 12, GROUP_SIZE)).toEqual([1, 2, 3, 4, 5])
    expect(getVisiblePages(5, 12, GROUP_SIZE)).toEqual([1, 2, 3, 4, 5])
  })

  it('묶음 끝을 넘으면 다음 묶음을 보여 준다', () => {
    expect(getVisiblePages(6, 12, GROUP_SIZE)).toEqual([6, 7, 8, 9, 10])
    expect(getVisiblePages(10, 12, GROUP_SIZE)).toEqual([6, 7, 8, 9, 10])
  })

  it('마지막 묶음은 남은 페이지만 보여 준다', () => {
    expect(getVisiblePages(11, 12, GROUP_SIZE)).toEqual([11, 12])
    expect(getVisiblePages(12, 12, GROUP_SIZE)).toEqual([11, 12])
  })

  it('묶음 크기를 바꾸면 그 크기로 나눈다', () => {
    expect(getVisiblePages(10, 25, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(getVisiblePages(11, 25, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(getVisiblePages(25, 25, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('페이지가 없으면 빈 목록을 돌려준다', () => {
    expect(getVisiblePages(1, 0, GROUP_SIZE)).toEqual([])
  })
})

describe('clampPage', () => {
  it('범위 안의 페이지는 그대로 둔다', () => {
    expect(clampPage(1, 12)).toBe(1)
    expect(clampPage(7, 12)).toBe(7)
    expect(clampPage(12, 12)).toBe(12)
  })

  it('1보다 작으면 첫 페이지로 맞춘다', () => {
    expect(clampPage(0, 12)).toBe(1)
    expect(clampPage(-3, 12)).toBe(1)
  })

  it('전체 페이지보다 크면 마지막 페이지로 맞춘다', () => {
    expect(clampPage(99, 12)).toBe(12)
  })

  it('숫자가 아니면 첫 페이지로 맞춘다', () => {
    expect(clampPage(Number.NaN, 12)).toBe(1)
    expect(clampPage(Number.POSITIVE_INFINITY, 12)).toBe(1)
  })

  it('소수는 소수점 아래를 버린다', () => {
    expect(clampPage(2.7, 12)).toBe(2)
  })
})

import { describe, expect, it } from 'vitest'
import { getHrefWithSearchParams, getPageParam, getParamValues } from './searchParams'

describe('getParamValues', () => {
  it('서버 searchParams 객체의 값 하나·여러 개·없음을 배열로 반환', () => {
    const searchParams = { q: 'UX', type: ['club', 'society'] }

    expect(getParamValues(searchParams, 'q')).toEqual(['UX'])
    expect(getParamValues(searchParams, 'type')).toEqual(['club', 'society'])
    expect(getParamValues(searchParams, 'sort')).toEqual([])
  })

  it('URLSearchParams의 같은 이름 값을 모두 반환', () => {
    expect(getParamValues(new URLSearchParams('type=club&type=society'), 'type')).toEqual([
      'club',
      'society',
    ])
  })
})

describe('getPageParam', () => {
  it('2 이상의 정수는 그대로, 소수는 버림', () => {
    expect(getPageParam({ page: '3' })).toBe(3)
    expect(getPageParam({ page: '2.7' })).toBe(2)
  })

  it('없거나 1보다 작거나 숫자가 아니면 1페이지', () => {
    expect(getPageParam({})).toBe(1)
    expect(getPageParam({ page: '0' })).toBe(1)
    expect(getPageParam({ page: 'abc' })).toBe(1)
  })
})

describe('getHrefWithSearchParams', () => {
  it('쿼리가 없으면 경로만 반환', () => {
    expect(getHrefWithSearchParams('/postings', new URLSearchParams())).toBe('/postings')
  })

  it('쿼리가 있으면 경로 뒤에 붙임', () => {
    expect(getHrefWithSearchParams('/postings', new URLSearchParams('q=UX&page=2'))).toBe(
      '/postings?q=UX&page=2',
    )
  })
})

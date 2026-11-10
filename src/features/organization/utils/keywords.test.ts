import { describe, expect, it } from 'vitest'
import { addKeyword } from './keywords'

describe('addKeyword', () => {
  it('앞뒤 공백을 제거해 끝에 추가', () => {
    expect(addKeyword(['UX'], '  디자인 ', 10)).toEqual(['UX', '디자인'])
  })

  it('빈 입력과 이미 있는 키워드는 추가하지 않음', () => {
    const keywords = ['UX']

    expect(addKeyword(keywords, '   ', 10)).toBe(keywords)
    expect(addKeyword(keywords, 'UX', 10)).toBe(keywords)
  })

  it('최대 개수에 도달하면 추가하지 않음', () => {
    const keywords = ['UX', '디자인']

    expect(addKeyword(keywords, '피그마', 2)).toBe(keywords)
    expect(addKeyword(keywords, '피그마', 3)).toEqual(['UX', '디자인', '피그마'])
  })
})

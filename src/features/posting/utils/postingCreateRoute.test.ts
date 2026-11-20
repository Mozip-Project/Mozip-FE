import { describe, expect, it } from 'vitest'
import { getNewPostingPath, parseHasInterview } from './postingCreateRoute'

describe('getNewPostingPath', () => {
  it('면접 여부를 interview 쿼리로 전달', () => {
    expect(getNewPostingPath(true)).toBe('/manage/postings/new?interview=true')
    expect(getNewPostingPath(false)).toBe('/manage/postings/new?interview=false')
  })
})

describe('parseHasInterview', () => {
  it('true·false 문자열만 면접 여부로 해석', () => {
    expect(parseHasInterview('true')).toBe(true)
    expect(parseHasInterview('false')).toBe(false)
  })

  it('값이 없거나 형식이 다르면 null', () => {
    expect(parseHasInterview(undefined)).toBeNull()
    expect(parseHasInterview('')).toBeNull()
    expect(parseHasInterview('yes')).toBeNull()
    expect(parseHasInterview(['true', 'false'])).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { EMPTY_POSTING_INFO, postingInfoSchema, type PostingInfoValues } from './postingInfoSchema'

const FILLED_VALUES = {
  ...EMPTY_POSTING_INFO,
  title: 'UXUX 14기 신입 부원 모집',
  mainImage: new File(['image'], 'main.png', { type: 'image/png' }),
  qualifications: ['student'],
} satisfies PostingInfoValues

function isValid(values: PostingInfoValues) {
  return postingInfoSchema.safeParse(values).success
}

describe('postingInfoSchema', () => {
  it('공고 제목, 대표 이미지, 지원 자격이 있으면 통과', () => {
    expect(isValid(FILLED_VALUES)).toBe(true)
  })

  it('빈 기본값은 실패', () => {
    expect(isValid(EMPTY_POSTING_INFO)).toBe(false)
  })

  it('공백뿐인 제목, 대표 이미지나 지원 자격이 없으면 실패', () => {
    expect(isValid({ ...FILLED_VALUES, title: '   ' })).toBe(false)
    expect(isValid({ ...FILLED_VALUES, mainImage: null })).toBe(false)
    expect(isValid({ ...FILLED_VALUES, qualifications: [] })).toBe(false)
  })
})

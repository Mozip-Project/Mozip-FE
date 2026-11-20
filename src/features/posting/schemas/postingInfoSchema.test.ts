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

  it('직접 입력을 고르면 내용이 있어야 통과, 고르지 않으면 비어 있어도 통과', () => {
    const custom = { ...FILLED_VALUES, qualifications: ['custom'] } satisfies PostingInfoValues

    expect(isValid(custom)).toBe(false)
    expect(isValid({ ...custom, customQualification: '   ' })).toBe(false)
    expect(isValid({ ...custom, customQualification: '1~3학년' })).toBe(true)
    expect(isValid({ ...FILLED_VALUES, customQualification: '' })).toBe(true)
  })
})

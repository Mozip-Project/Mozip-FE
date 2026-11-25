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

  it('새 파일 없이 저장된 대표 이미지만 있어도 통과', () => {
    expect(
      isValid({ ...FILLED_VALUES, mainImage: null, savedMainImageUrl: 'https://cdn/main.png' }),
    ).toBe(true)
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

  it('체크한 공개 항목은 내용이 있어야 통과, 체크하지 않은 항목은 비어 있어도 통과', () => {
    const withRegion = { ...FILLED_VALUES, publicItems: ['region'] } satisfies PostingInfoValues
    const withFee = { ...FILLED_VALUES, publicItems: ['fee'] } satisfies PostingInfoValues

    expect(isValid(withRegion)).toBe(false)
    expect(isValid({ ...withRegion, region: '   ' })).toBe(false)
    expect(isValid({ ...withRegion, region: '서울 마포구' })).toBe(true)
    expect(isValid(withFee)).toBe(false)
    expect(isValid({ ...withFee, fee: '30000' })).toBe(true)
    expect(isValid({ ...FILLED_VALUES, region: '', fee: '' })).toBe(true)
  })
})

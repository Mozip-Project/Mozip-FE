import { describe, expect, it } from 'vitest'
import {
  createOrganizationProfileSchema,
  type OrganizationProfileValues,
} from './organizationProfileSchema'

const FILLED_VALUES = {
  logo: new File(['logo'], 'logo.png', { type: 'image/png' }),
  introduction: 'UI/UX 디자인 동아리',
  categories: ['디자인 · 미디어'],
  keywords: ['UX'],
  links: [{ url: 'instagram.com/sample' }],
} satisfies OrganizationProfileValues

function isValid(values: OrganizationProfileValues, isStudentCouncil = false) {
  return createOrganizationProfileSchema(isStudentCouncil).safeParse(values).success
}

describe('createOrganizationProfileSchema', () => {
  it('필수 항목을 모두 채우면 통과', () => {
    expect(isValid(FILLED_VALUES)).toBe(true)
  })

  it('로고, 공백뿐인 소개, 키워드·링크 없음은 실패', () => {
    expect(isValid({ ...FILLED_VALUES, logo: null })).toBe(false)
    expect(isValid({ ...FILLED_VALUES, introduction: '   ' })).toBe(false)
    expect(isValid({ ...FILLED_VALUES, keywords: [] })).toBe(false)
    expect(
      isValid({ ...FILLED_VALUES, links: [{ url: 'instagram.com/sample' }, { url: '' }] }),
    ).toBe(false)
  })

  it('활동 분야는 학생회 외에만 필수', () => {
    const withoutCategories = { ...FILLED_VALUES, categories: [] }

    expect(isValid(withoutCategories)).toBe(false)
    expect(isValid(withoutCategories, true)).toBe(true)
  })
})

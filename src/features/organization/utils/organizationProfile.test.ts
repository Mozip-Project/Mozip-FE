import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_CATEGORIES,
  type OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import type { OrganizationProfileFieldsFragment } from '@/gql/graphql'
import {
  isStudentCouncil,
  toOrganizationProfileValues,
  toOrganizationSummary,
  toProfileFieldErrors,
  toUpdateOrganizationInput,
} from './organizationProfile'

const organization: OrganizationProfileFieldsFragment = {
  id: '1',
  name: 'UXUX',
  type: 'CLUB',
  scope: 'CAMPUS',
  school: { name: '과학기술연합대학원대학교' },
  logoUrl: 'https://example.com/logo.png',
  tagline: '사용자 경험을 연구하는 동아리',
  fields: ['DESIGN_MEDIA', 'IT_DEV'],
  keywords: ['UX', '디자인'],
  links: [{ id: 'link-1', url: 'https://instagram.com/uxux' }],
}

const values: OrganizationProfileValues = {
  logo: null,
  introduction: '사용자 경험을 연구하는 동아리',
  categories: ['디자인 · 미디어', 'IT · 개발'],
  keywords: ['UX', '디자인'],
  links: [{ url: 'https://instagram.com/uxux' }],
}

describe('isStudentCouncil', () => {
  it('학생회 유형만 true', () => {
    expect(isStudentCouncil({ type: 'STUDENT_COUNCIL' })).toBe(true)
    expect(isStudentCouncil({ type: 'CLUB' })).toBe(false)
    expect(isStudentCouncil({ type: 'ACADEMIC' })).toBe(false)
  })
})

describe('toOrganizationProfileValues', () => {
  it('서버 응답을 폼 초기값으로 변환', () => {
    expect(toOrganizationProfileValues(organization)).toEqual(values)
  })

  it('한 줄 소개가 없으면 빈 문자열', () => {
    expect(toOrganizationProfileValues({ ...organization, tagline: null }).introduction).toBe('')
  })

  it('링크가 없으면 빈 입력란 하나', () => {
    expect(toOrganizationProfileValues({ ...organization, links: [] }).links).toEqual([{ url: '' }])
  })
})

describe('toUpdateOrganizationInput', () => {
  it('폼 값을 저장 입력으로 변환하고 기존 로고는 그 주소를 다시 보냄', () => {
    expect(toUpdateOrganizationInput(values, false, 'https://cdn.test/logo.png')).toEqual({
      logoUrl: 'https://cdn.test/logo.png',
      tagline: '사용자 경험을 연구하는 동아리',
      fields: ['DESIGN_MEDIA', 'IT_DEV'],
      keywords: ['UX', '디자인'],
      links: [{ url: 'https://instagram.com/uxux' }],
    })
  })

  it('한 줄 소개와 링크의 앞뒤 공백 제거', () => {
    const input = toUpdateOrganizationInput(
      { ...values, introduction: '  소개  ', links: [{ url: ' https://a.com ' }] },
      false,
      null,
    )

    expect(input.tagline).toBe('소개')
    expect(input.links).toEqual([{ url: 'https://a.com' }])
  })

  it('프로토콜 없는 링크는 https를 붙이고 http·https 링크는 그대로', () => {
    const input = toUpdateOrganizationInput(
      {
        ...values,
        links: [
          { url: 'instagram.com/uxux' },
          { url: 'http://uxux.kr' },
          { url: 'HTTPS://youtube.com/@uxux' },
        ],
      },
      false,
      null,
    )

    expect(input.links).toEqual([
      { url: 'https://instagram.com/uxux' },
      { url: 'http://uxux.kr' },
      { url: 'HTTPS://youtube.com/@uxux' },
    ])
  })

  it('학생회는 활동 분야를 빈 배열로 보냄', () => {
    expect(toUpdateOrganizationInput(values, true, null).fields).toEqual([])
  })

  it('활동 분야 11개 모두 서버 값과 왕복 변환', () => {
    const input = toUpdateOrganizationInput(
      { ...values, categories: [...ACTIVITY_CATEGORIES] },
      false,
      null,
    )
    const restored = toOrganizationProfileValues({ ...organization, fields: input.fields })

    expect(new Set(input.fields).size).toBe(ACTIVITY_CATEGORIES.length)
    expect(restored.categories).toEqual([...ACTIVITY_CATEGORIES])
  })
})

describe('toProfileFieldErrors', () => {
  it('서버 필드 이름을 폼 입력 위치로 바꾸고 모르는 필드는 제외', () => {
    expect(
      toProfileFieldErrors([
        { field: 'tagline', message: '소개 오류' },
        { field: 'links[0].url', message: '링크 오류' },
        { field: 'keywords', message: '키워드 오류' },
        { field: 'fields', message: '분야 오류' },
        { field: 'logoUrl', message: '로고 오류' },
      ]),
    ).toEqual([
      { path: 'introduction', message: '소개 오류' },
      { path: 'links.0.url', message: '링크 오류' },
      { path: 'keywords', message: '키워드 오류' },
      { path: 'categories', message: '분야 오류' },
    ])
  })
})

describe('toOrganizationSummary', () => {
  it('단체 유형·공고 범위·학교를 화면 문구로 변환', () => {
    expect(toOrganizationSummary(organization)).toEqual({
      type: '동아리',
      scope: '교내',
      school: '과학기술연합대학원대학교',
    })
  })

  it('연합 단체는 학교 없음', () => {
    expect(toOrganizationSummary({ type: 'ACADEMIC', scope: 'UNION', school: null })).toEqual({
      type: '학회',
      scope: '연합',
      school: null,
    })
  })
})

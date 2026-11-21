import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_CATEGORIES,
  type OrganizationProfileValues,
} from '@/features/organization/schemas/organizationProfileSchema'
import type { OrganizationProfileFieldsFragment } from '@/gql/graphql'
import {
  isStudentCouncil,
  toOrganizationProfileValues,
  toUpdateOrganizationInput,
} from './organizationProfile'

const organization: OrganizationProfileFieldsFragment = {
  id: '1',
  name: 'UXUX',
  type: 'CLUB',
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
  it('폼 값을 저장 입력으로 변환하고 기존 로고 유지', () => {
    expect(toUpdateOrganizationInput(values, false)).toEqual({
      logoFileKey: null,
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
    )

    expect(input.tagline).toBe('소개')
    expect(input.links).toEqual([{ url: 'https://a.com' }])
  })

  it('학생회는 활동 분야를 빈 배열로 보냄', () => {
    expect(toUpdateOrganizationInput(values, true).fields).toEqual([])
  })

  it('활동 분야 11개 모두 서버 값과 왕복 변환', () => {
    const input = toUpdateOrganizationInput(
      { ...values, categories: [...ACTIVITY_CATEGORIES] },
      false,
    )
    const restored = toOrganizationProfileValues({ ...organization, fields: input.fields })

    expect(new Set(input.fields).size).toBe(ACTIVITY_CATEGORIES.length)
    expect(restored.categories).toEqual([...ACTIVITY_CATEGORIES])
  })
})

import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('텍스트 크기 토큰과 글자 색 클래스를 함께 유지한다', () => {
    expect(cn('text-on-brand-solid', 'text-body1')).toBe('text-on-brand-solid text-body1')
    expect(cn('text-brand', 'text-caption1')).toBe('text-brand text-caption1')
  })

  it('같은 유틸리티의 semantic 색은 마지막 값만 남긴다', () => {
    expect(cn('bg-brand-solid', 'bg-disabled')).toBe('bg-disabled')
    expect(cn('text-on-brand-solid', 'text-disabled')).toBe('text-disabled')
    expect(cn('border-neutral-muted', 'border-neutral-weak')).toBe('border-neutral-weak')
  })

  it('같은 종류의 텍스트 크기 토큰은 마지막 값만 남긴다', () => {
    expect(cn('text-body1', 'text-label1')).toBe('text-label1')
  })

  it('간격 토큰은 마지막 값만 남긴다', () => {
    expect(cn('px-padding-xl', 'px-padding-m')).toBe('px-padding-m')
    expect(cn('gap-gap-xs', 'gap-gap-l')).toBe('gap-gap-l')
  })

  it('반경 토큰은 마지막 값만 남긴다', () => {
    expect(cn('rounded-xxl', 'rounded-m')).toBe('rounded-m')
  })
})

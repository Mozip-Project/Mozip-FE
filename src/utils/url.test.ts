import { describe, expect, it } from 'vitest'
import { toWebUrl } from './url'

describe('toWebUrl', () => {
  it('http·https 주소는 그대로 사용', () => {
    expect(toWebUrl('https://notion.so/mozip-portfolio')).toBe('https://notion.so/mozip-portfolio')
    expect(toWebUrl('http://example.com')).toBe('http://example.com/')
  })

  it('프로토콜이 없으면 https를 붙임', () => {
    expect(toWebUrl('behance.net/mozip')).toBe('https://behance.net/mozip')
    expect(toWebUrl('  github.com/mozip  ')).toBe('https://github.com/mozip')
  })

  it('공백이 있거나 도메인 형식이 아니면 null', () => {
    expect(toWebUrl('')).toBeNull()
    expect(toWebUrl('   ')).toBeNull()
    expect(toWebUrl('behance mozip')).toBeNull()
    expect(toWebUrl('mozip')).toBeNull()
    expect(toWebUrl('example.')).toBeNull()
  })

  it('http·https가 아닌 프로토콜이면 null', () => {
    expect(toWebUrl('ftp://example.com')).toBeNull()
    expect(toWebUrl('javascript:alert(1)')).toBeNull()
    expect(toWebUrl('mailto:person@example.com')).toBeNull()
  })

  it('아이디·비밀번호가 들어간 주소는 null', () => {
    expect(toWebUrl('https://user:pass@example.com')).toBeNull()
  })
})

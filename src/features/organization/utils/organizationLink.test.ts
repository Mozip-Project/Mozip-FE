import { describe, expect, it } from 'vitest'
import { formatLinkAddress, getOrganizationLinkLabel, isHttpUrl } from './organizationLink'

describe('getOrganizationLinkLabel', () => {
  it('도메인에 따라 링크 이름 지정', () => {
    expect(getOrganizationLinkLabel('https://www.instagram.com/uxux_official')).toBe('인스타그램')
    expect(getOrganizationLinkLabel('https://youtube.com/@uxux')).toBe('유튜브')
    expect(getOrganizationLinkLabel('https://uxux.notion.site')).toBe('노션')
  })

  it('도메인 이름이 주소 경로에만 들어 있으면 웹사이트', () => {
    expect(getOrganizationLinkLabel('https://example.com/instagram.com')).toBe('웹사이트')
    expect(getOrganizationLinkLabel('https://notinstagram.com')).toBe('웹사이트')
  })

  it('주소 형식이 아니면 웹사이트', () => {
    expect(getOrganizationLinkLabel('uxux 홈페이지')).toBe('웹사이트')
  })
})

describe('isHttpUrl', () => {
  it('http·https 주소만 링크로 사용', () => {
    expect(isHttpUrl('https://uxux.notion.site')).toBe(true)
    expect(isHttpUrl('http://example.com')).toBe(true)
  })

  it('프로토콜 없는 주소나 다른 프로토콜은 링크로 쓰지 않음', () => {
    expect(isHttpUrl('instagram.com/uxux')).toBe(false)
    expect(isHttpUrl('mailto:uxux@example.com')).toBe(false)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('formatLinkAddress', () => {
  it('프로토콜과 www. 제거', () => {
    expect(formatLinkAddress('https://www.instagram.com/uxux_official')).toBe(
      'instagram.com/uxux_official',
    )
    expect(formatLinkAddress('http://uxux.notion.site')).toBe('uxux.notion.site')
  })
})

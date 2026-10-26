import { describe, expect, it } from 'vitest'
import { isActivePath } from './activePath'

describe('isActivePath', () => {
  it('경로가 같으면 현재 메뉴로 본다', () => {
    expect(isActivePath('/recruits', '/recruits')).toBe(true)
  })

  it('하위 경로에서도 상위 메뉴를 현재 메뉴로 본다', () => {
    expect(isActivePath('/recruits/12', '/recruits')).toBe(true)
  })

  it('이름이 앞부분만 같은 다른 경로는 현재 메뉴가 아니다', () => {
    expect(isActivePath('/recruitsearch', '/recruits')).toBe(false)
  })

  it('메뉴 주소의 쿼리와 해시는 비교에서 뺀다', () => {
    expect(isActivePath('/recruits', '/recruits?sort=latest')).toBe(true)
    expect(isActivePath('/recruits', '/recruits#top')).toBe(true)
  })

  it('홈은 정확히 같을 때만 현재 메뉴로 본다', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/recruits', '/')).toBe(false)
  })
})

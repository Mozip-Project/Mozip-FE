import { describe, expect, it } from 'vitest'
import { getActivePathMatch } from './activePath'

describe('getActivePathMatch', () => {
  it('경로가 같으면 현재 페이지로 본다', () => {
    expect(getActivePathMatch('/recruits', '/recruits')).toBe('page')
  })

  it('하위 경로에서는 상위 메뉴를 현재 영역으로 본다', () => {
    expect(getActivePathMatch('/recruits/12', '/recruits')).toBe('section')
  })

  it('이름이 앞부분만 같은 다른 경로는 현재 메뉴가 아니다', () => {
    expect(getActivePathMatch('/recruitsearch', '/recruits')).toBeUndefined()
  })

  it('메뉴 주소의 쿼리와 해시는 비교에서 뺀다', () => {
    expect(getActivePathMatch('/recruits', '/recruits?sort=latest')).toBe('page')
    expect(getActivePathMatch('/recruits', '/recruits#top')).toBe('page')
  })

  it('홈은 정확히 같을 때만 현재 메뉴로 본다', () => {
    expect(getActivePathMatch('/', '/')).toBe('page')
    expect(getActivePathMatch('/recruits', '/')).toBeUndefined()
  })
})

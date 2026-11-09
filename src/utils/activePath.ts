type ActivePathMatch = 'page' | 'section'

// 같은 경로는 page, 하위 경로는 section으로 구분, 홈(/)은 정확히 같을 때만 표시
function getActivePathMatch(pathname: string, href: string): ActivePathMatch | undefined {
  const [path] = href.split(/[?#]/)

  if (pathname === path) {
    return 'page'
  }

  if (path !== '/' && pathname.startsWith(`${path}/`)) {
    return 'section'
  }

  return undefined
}

// 여러 메뉴가 함께 일치하면 가장 긴 경로 하나만 현재 메뉴로 선택
function getClosestActivePath<THref extends string>(pathname: string, hrefs: readonly THref[]) {
  let closest: { href: THref; match: ActivePathMatch; length: number } | undefined

  for (const href of hrefs) {
    const match = getActivePathMatch(pathname, href)
    const [path = href] = href.split(/[?#]/)

    if (match && (!closest || path.length > closest.length)) {
      closest = { href, match, length: path.length }
    }
  }

  return closest && { href: closest.href, match: closest.match }
}

export { getActivePathMatch, getClosestActivePath, type ActivePathMatch }

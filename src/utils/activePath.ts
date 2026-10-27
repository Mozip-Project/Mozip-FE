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

export { getActivePathMatch, type ActivePathMatch }

// 하위 경로에서도 상위 메뉴를 현재 메뉴로 표시, 홈(/)은 정확히 같을 때만 표시
function isActivePath(pathname: string, href: string) {
  const [path] = href.split(/[?#]/)

  if (path === '/') {
    return pathname === '/'
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}

export { isActivePath }

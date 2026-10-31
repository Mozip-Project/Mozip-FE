'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, type ComponentProps } from 'react'
import { getActivePathMatch, type ActivePathMatch } from '@/utils/activePath'
import type { Route } from 'next'

type ActiveLinkProps = Omit<ComponentProps<typeof Link>, 'aria-current' | 'href'> & {
  href: Route
}

// 하위 경로의 상위 링크는 현재 페이지가 아니라 현재 영역으로 안내
const ARIA_CURRENT = {
  page: 'page',
  section: 'true',
} as const satisfies Record<ActivePathMatch, ComponentProps<'a'>['aria-current']>

// 동적 경로는 prerender 시 pathname을 몰라 현재 표시 없는 링크를 먼저 렌더링
function ActiveLink(props: ActiveLinkProps) {
  return (
    <Suspense fallback={<Link {...props} />}>
      <PathnameLink {...props} />
    </Suspense>
  )
}

function PathnameLink(props: ActiveLinkProps) {
  const pathname = usePathname()
  const match = getActivePathMatch(pathname, props.href)

  return <Link aria-current={match && ARIA_CURRENT[match]} {...props} />
}

export { ActiveLink }

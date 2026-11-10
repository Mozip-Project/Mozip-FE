'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ARIA_CURRENT } from '@/components/ui/ActiveLink/activeLink'
import { cn } from '@/lib/utils'
import { getClosestActivePath } from '@/utils/activePath'
import type { Route } from 'next'

const LINK_CLASS = cn(
  'flex min-h-13 items-center rounded-m py-padding-xs pr-padding-s pl-10 text-headline2 font-medium break-words text-neutral-muted',
  'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
  'not-aria-[current]:hover:bg-transparent-pressed',
  'aria-[current]:bg-neutral-weak aria-[current]:font-semibold aria-[current]:text-brand',
)

// href가 없는 항목은 이동 대신 onSelect 실행 (준비 중 안내 등)
type SidebarItem =
  | { label: string; href: Route; onSelect?: never }
  | { label: string; href?: never; onSelect: () => void }

type SidebarLinksProps = {
  items: SidebarItem[]
}

// 동적 경로는 prerender 시 pathname을 몰라 현재 표시 없는 목록을 먼저 렌더링
function SidebarLinks({ items }: SidebarLinksProps) {
  return (
    <Suspense fallback={<SidebarLinkList items={items} />}>
      <PathnameSidebarLinks items={items} />
    </Suspense>
  )
}

function PathnameSidebarLinks({ items }: SidebarLinksProps) {
  const pathname = usePathname()
  const current = getClosestActivePath(
    pathname,
    items.flatMap((item) => (item.href ? [item.href] : [])),
  )

  return <SidebarLinkList items={items} current={current} />
}

type SidebarLinkListProps = SidebarLinksProps & {
  current?: ReturnType<typeof getClosestActivePath<Route>>
}

function SidebarLinkList({ items, current }: SidebarLinkListProps) {
  return (
    <ul className="flex flex-col gap-gap-xs">
      {items.map((item) => (
        <li key={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              aria-current={current?.href === item.href ? ARIA_CURRENT[current.match] : undefined}
              className={LINK_CLASS}
            >
              {item.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={item.onSelect}
              className={cn(LINK_CLASS, 'w-full cursor-pointer text-left')}
            >
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export { SidebarLinks }
export type { SidebarItem }

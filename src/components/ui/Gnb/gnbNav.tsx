'use client'

import { usePathname } from 'next/navigation'
import { isActivePath } from '@/utils/activePath'
import { NavItem } from './navItem'
import type { Route } from 'next'

type GnbNavItem = {
  label: string
  href: Route
}

type GnbNavProps = {
  items: GnbNavItem[]
}

function GnbNav({ items }: GnbNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="주요 메뉴">
      <ul className="flex items-center gap-gap-xxs">
        {items.map((item) => (
          <li key={item.href}>
            <NavItem href={item.href} isActive={isActivePath(pathname, item.href)}>
              {item.label}
            </NavItem>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { GnbNav, type GnbNavItem }

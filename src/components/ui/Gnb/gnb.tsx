import Link from 'next/link'
import { GnbHeader } from './gnbHeader'
import { GnbNav, type GnbNavItem } from './gnbNav'
import type { Route } from 'next'
import type { ReactNode } from 'react'

type GnbProps = {
  navItems: GnbNavItem[]
  homeHref?: Route
  actions: ReactNode
}

function Gnb({ navItems, homeHref, actions }: GnbProps) {
  return (
    <GnbHeader>
      <div className="mx-auto flex h-(--gnb-height) w-full max-w-page items-center gap-gap-xl">
        <div className="flex min-w-0 items-center gap-8">
          {/* TODO: 실제 로고로 교체 */}
          <Link
            href={homeHref ?? '/'}
            aria-label="MOZIP. 홈"
            className="flex h-8 w-24 shrink-0 items-center rounded-s text-heading2 font-bold text-neutral outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            LOGO
          </Link>

          <GnbNav items={navItems} />
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-gap-m">{actions}</div>
      </div>
    </GnbHeader>
  )
}

export { Gnb }

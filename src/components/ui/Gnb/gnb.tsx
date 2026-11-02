import Link from 'next/link'
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
    <header
      data-slot="gnb"
      className="sticky top-0 z-20 border-b border-neutral-subtle bg-layer-default px-page-padding"
    >
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-gap-xl">
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
    </header>
  )
}

export { Gnb }

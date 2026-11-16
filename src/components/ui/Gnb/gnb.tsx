import Image from 'next/image'
import Link from 'next/link'
import mozipLogo from '@/assets/images/mozipLogo.svg'
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
          <Link
            href={homeHref ?? '/'}
            aria-label="mozip. 홈"
            className="flex h-8 w-24 shrink-0 items-center rounded-s outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
          >
            <Image src={mozipLogo} alt="" className="h-auto w-24" />
          </Link>

          <GnbNav items={navItems} />
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-gap-m">{actions}</div>
      </div>
    </GnbHeader>
  )
}

export { Gnb }

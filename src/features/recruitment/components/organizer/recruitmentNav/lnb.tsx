import type { ReactNode } from 'react'

type LnbProps = {
  switcher: ReactNode
  children: ReactNode
}

function Lnb({ switcher, children }: LnbProps) {
  return (
    <nav data-slot="lnb" aria-label="모집 메뉴" className="flex flex-col gap-gap-l">
      {switcher}
      <ul className="flex flex-col gap-gap-xxs">{children}</ul>
    </nav>
  )
}

export { Lnb }

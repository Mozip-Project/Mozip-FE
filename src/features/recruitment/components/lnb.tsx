import type { ReactNode } from 'react'

type LnbProps = {
  switcher: ReactNode
  children: ReactNode
}

function Lnb({ switcher, children }: LnbProps) {
  return (
    <div data-slot="lnb" className="flex flex-col gap-gap-l">
      {switcher}
      <ul className="flex flex-col gap-gap-xs">{children}</ul>
    </div>
  )
}

export { Lnb }

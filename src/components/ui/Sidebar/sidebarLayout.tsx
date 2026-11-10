import type { ReactNode } from 'react'

type SidebarLayoutProps = {
  sidebar: ReactNode
  children: ReactNode
}

function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-12">
      {sidebar}
      <main className="min-w-0">{children}</main>
    </div>
  )
}

export { SidebarLayout }

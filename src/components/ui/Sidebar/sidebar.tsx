import { useId } from 'react'
import { SidebarLinks, type SidebarItem } from './sidebarLinks'

type SidebarProps = {
  title: string
  items: SidebarItem[]
}

function Sidebar({ title, items }: SidebarProps) {
  const titleId = useId()

  return (
    <nav aria-labelledby={titleId} className="flex flex-col gap-gap-l">
      <p id={titleId} className="text-heading2 font-bold text-neutral">
        {title}
      </p>
      <SidebarLinks items={items} />
    </nav>
  )
}

export { Sidebar }
export type { SidebarItem }

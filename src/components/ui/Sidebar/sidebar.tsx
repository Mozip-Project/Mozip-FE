import { useId } from 'react'
import { ActiveLink } from '@/components/ui/ActiveLink/activeLink'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type SidebarItem = {
  label: string
  href: Route
}

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
      <ul className="flex flex-col gap-gap-xs">
        {items.map((item) => (
          <li key={item.href}>
            <ActiveLink
              href={item.href}
              className={cn(
                'flex min-h-13 items-center rounded-m py-padding-xs pr-padding-s pl-10 text-headline2 font-medium break-words text-neutral-muted',
                'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
                'not-aria-[current]:hover:bg-transparent-pressed',
                'aria-[current]:bg-neutral-weak aria-[current]:font-semibold aria-[current]:text-brand',
              )}
            >
              {item.label}
            </ActiveLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { Sidebar }
export type { SidebarItem }

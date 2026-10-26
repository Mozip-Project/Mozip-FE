import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type NavItemProps = ComponentProps<typeof Link> & {
  isActive?: boolean
}

function NavItem({ className, isActive = false, ...props }: NavItemProps) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      data-slot="nav-item"
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-m px-padding-m text-body2 font-medium whitespace-nowrap text-neutral-muted',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none',
        'hover:text-neutral not-aria-[current=page]:hover:bg-transparent-pressed',
        'aria-[current=page]:bg-neutral-weak aria-[current=page]:font-semibold aria-[current=page]:text-neutral',
        className,
      )}
      {...props}
    />
  )
}

export { NavItem }

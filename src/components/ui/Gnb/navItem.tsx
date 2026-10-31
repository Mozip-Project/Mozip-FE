import { ActiveLink } from '@/components/ui/ActiveLink/activeLink'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

function NavItem({ className, ...props }: ComponentProps<typeof ActiveLink>) {
  return (
    <ActiveLink
      data-slot="nav-item"
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-m px-padding-m text-body2 font-medium whitespace-nowrap text-neutral-muted',
        'transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid motion-reduce:transition-none',
        'hover:text-neutral not-aria-[current]:hover:bg-transparent-pressed',
        'aria-[current]:bg-neutral-weak aria-[current]:font-semibold aria-[current]:text-neutral',
        className,
      )}
      {...props}
    />
  )
}

export { NavItem }

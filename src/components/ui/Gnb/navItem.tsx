import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ActivePathMatch } from '@/utils/activePath'
import type { ComponentProps } from 'react'

type NavItemProps = ComponentProps<typeof Link> & {
  current?: ActivePathMatch
}

// 하위 경로의 상위 메뉴는 현재 페이지가 아니라 현재 영역으로 안내
const ARIA_CURRENT = {
  page: 'page',
  section: 'true',
} as const satisfies Record<ActivePathMatch, ComponentProps<'a'>['aria-current']>

function NavItem({ className, current, ...props }: NavItemProps) {
  return (
    <Link
      aria-current={current && ARIA_CURRENT[current]}
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

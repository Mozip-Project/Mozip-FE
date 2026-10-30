import Link from 'next/link'
import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type BackLinkProps = {
  href: ComponentProps<typeof Link>['href']
  label: string
  className?: string
}

function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      data-slot="back-link"
      className={cn(
        'inline-flex items-center gap-gap-xxs rounded-xs text-label1 font-medium whitespace-nowrap text-neutral-subtle',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
        className,
      )}
    >
      <ChevronLeftIcon aria-hidden className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

export { BackLink }

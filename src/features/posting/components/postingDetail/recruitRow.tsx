import Link from 'next/link'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import type { Route } from 'next'

type RecruitRowProps = {
  title: string
  summary: string
  href: Route
}

function RecruitRow({ title, summary, href }: RecruitRowProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-gap-m rounded-m border border-neutral-muted bg-layer-default p-padding-m outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-gap-xxs font-medium break-words break-keep text-neutral">
        <span className="text-body2">{title}</span>
        <span className="text-caption1 text-neutral-subtle">{summary}</span>
      </span>
      <ChevronRightIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
    </Link>
  )
}

export { RecruitRow }

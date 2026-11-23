import Link from 'next/link'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge } from '@/components/ui/Badge/badge'
import type { PostingRecruitmentPhase } from '@/features/posting/types'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import type { Route } from 'next'

type RecruitRowProps = {
  title: string
  phase: PostingRecruitmentPhase
  href: Route
}

function RecruitRow({ title, phase, href }: RecruitRowProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-gap-m rounded-m border border-neutral-muted bg-layer-default p-padding-m outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid"
    >
      <span className="flex min-w-0 flex-1 items-center gap-gap-s">
        <Badge {...getRecruitmentStatusBadgeProps(phase)} className="shrink-0" />
        <span className="min-w-0 text-body2 font-medium break-words break-keep text-neutral">
          {title}
        </span>
      </span>
      <ChevronRightIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
    </Link>
  )
}

export { RecruitRow }

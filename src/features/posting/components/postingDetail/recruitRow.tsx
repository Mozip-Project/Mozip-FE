import Link from 'next/link'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { Badge } from '@/components/ui/Badge/badge'
import type { PostingRecruitmentPhase } from '@/features/posting/types'
import { getRecruitmentStatusBadgeProps } from '@/features/posting/utils/scheduleBadge'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type RecruitRowProps = {
  title: string
  phase: PostingRecruitmentPhase
  // 없으면 이동 없이 내용만 표시 (공고 미리보기)
  href?: Route
}

const ROW_CLASS_NAME =
  'flex w-full items-center gap-gap-m rounded-m border border-neutral-muted bg-layer-default p-padding-m'

function RecruitRow({ title, phase, href }: RecruitRowProps) {
  const content = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-gap-s">
        <span className="min-w-0 text-body2 font-medium break-words break-keep text-neutral">
          {title}
        </span>
        <Badge {...getRecruitmentStatusBadgeProps(phase)} className="shrink-0" />
      </span>
      <ChevronRightIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
    </>
  )

  if (!href) {
    return <div className={ROW_CLASS_NAME}>{content}</div>
  }

  return (
    <Link
      href={href}
      className={cn(
        ROW_CLASS_NAME,
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
      )}
    >
      {content}
    </Link>
  )
}

export { RecruitRow }

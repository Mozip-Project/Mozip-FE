import Link from 'next/link'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type SectionHeaderProps = {
  title: string
  moreHref?: ComponentProps<typeof Link>['href']
  moreLabel?: string
  className?: string
}

function SectionHeader({
  title,
  moreHref,
  moreLabel = '전체 보기',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <h2 className="min-w-0 flex-1 text-heading2 font-semibold break-words text-neutral">
        {title}
      </h2>
      {moreHref && (
        <Link
          href={moreHref}
          // 반복되는 "전체 보기"에 섹션 이름 포함
          aria-label={`${title} ${moreLabel}`}
          className={cn(
            'flex shrink-0 items-center gap-gap-xxs rounded-xs text-body2 font-medium whitespace-nowrap text-neutral-subtle',
            'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
          )}
        >
          {moreLabel}
          <ChevronRightIcon aria-hidden />
        </Link>
      )}
    </div>
  )
}

export { SectionHeader }

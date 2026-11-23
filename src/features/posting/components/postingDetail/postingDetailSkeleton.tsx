import { BackLink } from '@/components/ui/BackLink/backLink'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

// 핵심 정보, 일정 값 길이
const FACT_VALUE_WIDTHS = ['w-36', 'w-10', 'w-56', 'w-32'] as const
const SCHEDULE_VALUE_WIDTHS = ['w-64', 'w-24', 'w-40'] as const
const TAB_LABEL_WIDTHS = ['w-18', 'w-20', 'w-32'] as const
const CONTENT_LINE_WIDTHS = ['w-full', 'w-full', 'w-11/12', 'w-2/3'] as const

type PostingDetailSkeletonProps = {
  backLink: ComponentProps<typeof BackLink>
}

function SummaryRows({ valueWidths }: { valueWidths: readonly string[] }) {
  return (
    <div className="flex flex-col gap-gap-m">
      {valueWidths.map((width, index) => (
        <div key={index} className="flex items-center gap-gap-l">
          <span className="skeleton-bar h-5 w-14 rounded-full" />
          <span className={cn('skeleton-bar h-5 rounded-full', width)} />
        </div>
      ))}
    </div>
  )
}

// TODO: 로딩 화면 디자인 확인
function PostingDetailSkeleton({ backLink }: PostingDetailSkeletonProps) {
  return (
    <div className="mx-auto flex max-w-195 flex-col gap-gap-xl">
      <BackLink {...backLink} />
      <div role="status">
        <span className="sr-only">공고 불러오는 중</span>
        <div aria-hidden className="flex animate-skeleton-delayed-show flex-col gap-gap-xl">
          <div className="flex items-center gap-gap-xl">
            <div className="flex min-w-0 flex-1 items-center gap-gap-m">
              <span className="skeleton-bar h-9.5 w-80 max-w-full rounded-full" />
              <span className="skeleton-bar h-6 w-14 rounded-xs" />
            </div>
            <span className="skeleton-bar h-10 w-24 rounded-s" />
          </div>

          <div className="flex flex-col gap-padding-l py-padding-l">
            <SummaryRows valueWidths={FACT_VALUE_WIDTHS} />
            <div className="border-t border-neutral-subtle pt-padding-l">
              <SummaryRows valueWidths={SCHEDULE_VALUE_WIDTHS} />
            </div>
          </div>

          <div className="flex h-12 items-center gap-gap-l border-b border-neutral-subtle">
            {TAB_LABEL_WIDTHS.map((width, index) => (
              <span key={index} className={cn('skeleton-bar h-6 rounded-full', width)} />
            ))}
          </div>

          <div className="flex flex-col gap-gap-xxl">
            <span className="skeleton-bar aspect-2/1 w-full rounded-l" />
            <div className="flex flex-col gap-gap-s">
              <span className="skeleton-bar h-6.5 w-48 rounded-full" />
              {CONTENT_LINE_WIDTHS.map((width, index) => (
                <span key={index} className={cn('skeleton-bar h-5.5 rounded-full', width)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PostingDetailSkeleton }

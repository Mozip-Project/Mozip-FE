import Link from 'next/link'
import ChevronLeftIcon from '@/assets/icons/chevronLeft.svg'
import ChevronRightIcon from '@/assets/icons/chevronRight.svg'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

const ITEM_BOX_CLASS = 'flex size-8 shrink-0 items-center justify-center rounded-m'
const FOCUS_RING_CLASS =
  'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus-ring'

type PageItemProps = {
  page: number
  href: Route
  isCurrent: boolean
}

function PageItem({ page, href, isCurrent }: PageItemProps) {
  return (
    <Link
      href={href}
      aria-label={`${page}페이지`}
      aria-current={isCurrent ? 'page' : undefined}
      data-slot="page-item"
      className={cn(
        ITEM_BOX_CLASS,
        FOCUS_RING_CLASS,
        'text-label1 font-medium text-neutral-muted',
        'aria-[current=page]:bg-neutral-solid aria-[current=page]:font-semibold aria-[current=page]:text-on-neutral-solid',
      )}
    >
      {page}
    </Link>
  )
}

type ArrowDirection = 'previous' | 'next'

const ARROW_CONTENT = {
  previous: { label: '이전 페이지', Icon: ChevronLeftIcon },
  next: { label: '다음 페이지', Icon: ChevronRightIcon },
} satisfies Record<ArrowDirection, { label: string; Icon: typeof ChevronLeftIcon }>

type PageArrowProps = {
  direction: ArrowDirection
  href?: Route
}

function PageArrow({ direction, href }: PageArrowProps) {
  const { label, Icon } = ARROW_CONTENT[direction]

  // 이동할 페이지가 없으면 링크 대신 비활성 표시만 남겨 화살표 자리 유지
  if (!href) {
    return (
      <span
        aria-hidden
        data-slot="page-arrow"
        className={cn(ITEM_BOX_CLASS, 'text-disabled [&_svg]:size-4.5')}
      >
        <Icon />
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label={label}
      data-slot="page-arrow"
      className={cn(ITEM_BOX_CLASS, FOCUS_RING_CLASS, 'text-neutral-subtle [&_svg]:size-4.5')}
    >
      <Icon aria-hidden />
    </Link>
  )
}

export { PageArrow, PageItem }

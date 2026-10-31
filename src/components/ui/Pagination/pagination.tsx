import { cn } from '@/lib/utils'
import { clampPage, getVisiblePages } from '@/utils/pagination'
import { PageArrow, PageItem, type PageNavigateHandler } from './pageItem'
import type { Route } from 'next'

const PAGE_GROUP_SIZE = 5

type PaginationProps = {
  currentPage: number
  totalPages: number
  getPageHref: (page: number) => Route
  onPageNavigate?: PageNavigateHandler
  className?: string
}

function Pagination({
  currentPage,
  totalPages,
  getPageHref,
  onPageNavigate,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const safeCurrentPage = clampPage(currentPage, totalPages)
  const pages = getVisiblePages(safeCurrentPage, totalPages, PAGE_GROUP_SIZE)
  const hasPreviousPage = safeCurrentPage > 1
  const hasNextPage = safeCurrentPage < totalPages

  return (
    <nav
      aria-label="페이지 이동"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
    >
      <ul className="flex items-center gap-gap-xs">
        <li>
          <PageArrow
            direction="previous"
            href={hasPreviousPage ? getPageHref(safeCurrentPage - 1) : undefined}
            onNavigate={onPageNavigate}
          />
        </li>
        {pages.map((page) => (
          <li key={page}>
            <PageItem
              page={page}
              href={getPageHref(page)}
              isCurrent={page === safeCurrentPage}
              onNavigate={onPageNavigate}
            />
          </li>
        ))}
        <li>
          <PageArrow
            direction="next"
            href={hasNextPage ? getPageHref(safeCurrentPage + 1) : undefined}
            onNavigate={onPageNavigate}
          />
        </li>
      </ul>
    </nav>
  )
}

export { Pagination }

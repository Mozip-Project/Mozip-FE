'use client'

import { Pagination } from '@/components/ui/Pagination/pagination'
import { usePostingListQuery } from './postingListQueryContext'

type PostingListPaginationProps = {
  totalPages: number
}

function PostingListPagination({ totalPages }: PostingListPaginationProps) {
  const { query, getPageHref, navigateToPage } = usePostingListQuery()

  return (
    <Pagination
      currentPage={query.page}
      totalPages={totalPages}
      getPageHref={getPageHref}
      onPageNavigate={navigateToPage}
    />
  )
}

export { PostingListPagination }

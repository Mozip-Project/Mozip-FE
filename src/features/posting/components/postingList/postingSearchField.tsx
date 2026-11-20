'use client'

import { SearchField } from '@/components/ui/SearchField/searchField'
import { usePostingListQuery } from './postingListQueryContext'

function PostingSearchField() {
  const { keyword, changeKeyword } = usePostingListQuery()

  return (
    <SearchField
      aria-label="공고 검색"
      placeholder="단체명, 키워드 검색"
      value={keyword}
      onValueChange={changeKeyword}
      className="w-90"
    />
  )
}

export { PostingSearchField }

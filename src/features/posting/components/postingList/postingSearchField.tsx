'use client'

import { SearchField } from '@/components/ui/SearchField/searchField'
import { usePostingListQuery } from './postingListQueryContext'

function PostingSearchField() {
  const { keyword, changeKeyword } = usePostingListQuery()

  return (
    <SearchField
      aria-label="공고 검색"
      placeholder="단체명 또는 키워드를 검색해 주세요"
      value={keyword}
      onValueChange={changeKeyword}
      className="w-90"
    />
  )
}

export { PostingSearchField }

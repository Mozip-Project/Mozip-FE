'use client'

import { SearchField } from '@/components/ui/SearchField/searchField'
import { usePostingListQuery } from './postingListQueryContext'
import type { FormEvent } from 'react'

function PostingSearchField() {
  const { keyword, changeKeyword, submitKeyword } = usePostingListQuery()

  // Enter·모바일 키보드 검색 버튼에서 대기 없이 검색
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitKeyword()
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <SearchField
        aria-label="공고 검색"
        placeholder="단체명, 공고명 또는 키워드를 검색해주세요"
        value={keyword}
        onValueChange={changeKeyword}
        className="w-90"
      />
    </form>
  )
}

export { PostingSearchField }

'use client'

import { usePostingListQuery } from '@/features/posting/components/postingList/postingListQueryContext'
import { PostingFilterGroup } from './postingFilterGroup'

function PostingFilterPanel() {
  const { query, changeQuery } = usePostingListQuery()

  return <PostingFilterGroup values={query} onValuesChange={changeQuery} />
}

export { PostingFilterPanel }

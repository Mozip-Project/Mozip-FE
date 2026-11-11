'use client'

import SortIcon from '@/assets/icons/sort.svg'
import { FilterSelect } from '@/components/ui/FilterSelect/filterSelect'
import { POSTING_SORT_LABEL, POSTING_SORTS } from '@/features/posting/types'
import { usePostingListQuery } from './postingListQueryContext'

const SORT_OPTIONS = POSTING_SORTS.map((sort) => ({ value: sort, label: POSTING_SORT_LABEL[sort] }))

function PostingSortSelect() {
  const { query, changeQuery } = usePostingListQuery()

  return (
    <FilterSelect
      label="정렬"
      icon={<SortIcon aria-hidden />}
      options={SORT_OPTIONS}
      value={query.sort}
      onValueChange={(sort) => changeQuery({ sort })}
    />
  )
}

export { PostingSortSelect }

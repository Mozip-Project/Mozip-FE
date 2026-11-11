import { PostingFilterChips } from '@/features/posting/components/postingFilter/postingFilterChips'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import { getPostingListSample } from '@/features/posting/mocks/postingListSample'
import {
  getPostingListHref,
  parsePostingListQuery,
} from '@/features/posting/utils/postingListQuery'
import type { SearchParamsSource } from '@/utils/searchParams'
import { PostingListContent } from './postingListContent'
import { PostingSortSelect } from './postingSortSelect'
import type { Route } from 'next'

type PostingListBoardProps = {
  pathname: Route
  searchParams: Promise<SearchParamsSource>
}

async function PostingListBoard({ pathname, searchParams }: PostingListBoardProps) {
  const query = parsePostingListQuery(await searchParams)
  // TODO: 공고 목록 API 연결 후 샘플 데이터 교체, 검색·필터·정렬 조건 반영
  const { totalCount, totalPages, postings } = getPostingListSample(query.page)

  return (
    <div className="flex items-start gap-12">
      <div className="w-55 shrink-0">
        <PostingFilterPanel />
      </div>
      <div className="min-w-0 flex-1">
        <PostingListContent
          totalCount={totalCount}
          postings={postings}
          currentPage={query.page}
          totalPages={totalPages}
          getPageHref={(page) => getPostingListHref(pathname, { ...query, page })}
          sortControl={<PostingSortSelect />}
          appliedFilters={<PostingFilterChips />}
        />
      </div>
    </div>
  )
}

export { PostingListBoard }

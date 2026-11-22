import { Suspense } from 'react'
import { getPostings } from '@/features/posting/api/applicant/api'
import { PostingFilterChips } from '@/features/posting/components/postingFilter/postingFilterChips'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import type { PostingListQuery } from '@/features/posting/types'
import { getPostingListTotalPages, toPostingListItem } from '@/features/posting/utils/postingList'
import { parsePostingListQuery } from '@/features/posting/utils/postingListQuery'
import type { SearchParamsSource } from '@/utils/searchParams'
import { PostingListContent } from './postingListContent'
import { PostingListPagination } from './postingListPagination'
import { PostingListSkeleton } from './postingListSkeleton'
import { PostingSortSelect } from './postingSortSelect'

const POSTING_LIST_PAGE_SIZE = 9

type PostingListBoardProps = {
  searchParams: Promise<SearchParamsSource>
}

async function PostingListBoard({ searchParams }: PostingListBoardProps) {
  const query = parsePostingListQuery(await searchParams)

  return (
    <div className="flex items-start gap-12">
      <div className="w-55 shrink-0">
        <PostingFilterPanel />
      </div>
      <div className="min-w-0 flex-1">
        {/* 조회 조건이 바뀌면 이전 목록 대신 스켈레톤을 보이도록 경계를 새로 만듦 */}
        <Suspense
          key={JSON.stringify(query)}
          fallback={<PostingListSkeleton cardCount={POSTING_LIST_PAGE_SIZE} />}
        >
          <PostingListResults query={query} />
        </Suspense>
      </div>
    </div>
  )
}

type PostingListResultsProps = {
  query: PostingListQuery
}

async function PostingListResults({ query }: PostingListResultsProps) {
  // TODO: 검색·필터·정렬 조건 반영
  // 화면 페이지는 1부터, 서버 페이지는 0부터
  const { totalCount, items } = await getPostings(query.page - 1, POSTING_LIST_PAGE_SIZE)
  const now = new Date()

  return (
    <PostingListContent
      totalCount={totalCount}
      postings={items.map((card) => toPostingListItem(card, now))}
      sortControl={<PostingSortSelect />}
      appliedFilters={<PostingFilterChips />}
      pagination={
        <PostingListPagination
          totalPages={getPostingListTotalPages(totalCount, POSTING_LIST_PAGE_SIZE)}
        />
      }
    />
  )
}

export { PostingListBoard }

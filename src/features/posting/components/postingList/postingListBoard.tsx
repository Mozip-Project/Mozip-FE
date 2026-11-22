import { unstable_rethrow } from 'next/navigation'
import { Suspense } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { getPostings } from '@/features/posting/api/applicant/api'
import { PostingFilterChips } from '@/features/posting/components/postingFilter/postingFilterChips'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
import type { PostingListQuery } from '@/features/posting/types'
import {
  getPostingListTotalPages,
  toPostingListItem,
  toPostingsVariables,
} from '@/features/posting/utils/postingList'
import { parsePostingListQuery } from '@/features/posting/utils/postingListQuery'
import type { PostingsQueryVariables } from '@/gql/graphql'
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

async function getPostingsOrNull(variables: PostingsQueryVariables) {
  try {
    return await getPostings(variables)
  } catch (error) {
    unstable_rethrow(error)
    console.error(error)
    return null
  }
}

async function PostingListResults({ query }: PostingListResultsProps) {
  const postingPage = await getPostingsOrNull(toPostingsVariables(query, POSTING_LIST_PAGE_SIZE))

  if (!postingPage) {
    return (
      <div role="alert">
        <EmptyState
          icon={<FileTextIcon className="size-7" />}
          title="조회에 실패했어요"
          className="min-h-162.5 justify-center border-0"
        />
      </div>
    )
  }

  const { totalCount, items } = postingPage
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

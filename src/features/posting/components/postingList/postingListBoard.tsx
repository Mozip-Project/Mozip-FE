import { unstable_rethrow } from 'next/navigation'
import { Suspense } from 'react'
import FileTextIcon from '@/assets/icons/fileText.svg'
import { EmptyState } from '@/components/ui/EmptyState/emptyState'
import { getPostings } from '@/features/posting/api/applicant/api'
import { PostingFilterChips } from '@/features/posting/components/postingFilter/postingFilterChips'
import { PostingFilterPanel } from '@/features/posting/components/postingFilter/postingFilterPanel'
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

type PostingPagePromise = ReturnType<typeof getPostingsOrNull>

type PostingListBoardProps = {
  searchParams: Promise<SearchParamsSource>
}

async function PostingListBoard({ searchParams }: PostingListBoardProps) {
  const query = parsePostingListQuery(await searchParams)
  const postingPagePromise = getPostingsOrNull(toPostingsVariables(query, POSTING_LIST_PAGE_SIZE))
  // 조건이 바뀌면 경계를 새로 만들어 로딩 표시, 정렬·칩은 경계 밖이라 focus 유지
  const resultKey = JSON.stringify(query)

  return (
    <div className="flex items-start gap-12">
      <div className="w-55 shrink-0">
        <PostingFilterPanel />
      </div>
      <section className="flex min-w-0 flex-1 flex-col gap-gap-l">
        <h2 className="sr-only">공고 목록</h2>
        <div className="flex items-center justify-between gap-gap-l">
          <p role="status" className="text-body2 font-medium text-neutral">
            <Suspense
              key={resultKey}
              fallback={
                <span
                  aria-hidden
                  className="skeleton-bar inline-block h-4 w-16 animate-skeleton-delayed-show rounded-full align-middle"
                />
              }
            >
              <PostingTotalCount postingPagePromise={postingPagePromise} />
            </Suspense>
          </p>
          <PostingSortSelect />
        </div>
        <PostingFilterChips />
        <Suspense
          key={resultKey}
          fallback={<PostingListSkeleton cardCount={POSTING_LIST_PAGE_SIZE} />}
        >
          <PostingListResults postingPagePromise={postingPagePromise} />
        </Suspense>
      </section>
    </div>
  )
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

type PostingResultProps = {
  postingPagePromise: PostingPagePromise
}

async function PostingTotalCount({ postingPagePromise }: PostingResultProps) {
  const postingPage = await postingPagePromise

  if (!postingPage) {
    return null
  }

  return <>총 {postingPage.totalCount.toLocaleString('ko-KR')}건</>
}

async function PostingListResults({ postingPagePromise }: PostingResultProps) {
  const postingPage = await postingPagePromise

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
      pagination={
        <PostingListPagination
          totalPages={getPostingListTotalPages(totalCount, POSTING_LIST_PAGE_SIZE)}
        />
      }
    />
  )
}

export { PostingListBoard }

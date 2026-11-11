'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, use, useOptimistic, useTransition, type ReactNode } from 'react'
import type { PostingListQuery } from '@/features/posting/types'
import {
  getPostingListHref,
  parsePostingListQuery,
} from '@/features/posting/utils/postingListQuery'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import type { Route } from 'next'

type PostingListQueryChange = Partial<Omit<PostingListQuery, 'page'>>

type PostingListQueryContextValue = {
  query: PostingListQuery
  // URL 반영 전 입력 중인 글자 포함
  keyword: string
  changeQuery: (change: PostingListQueryChange) => void
  changeKeyword: (keyword: string) => void
  getPageHref: (page: number) => Route
  navigateToPage: (href: Route) => void
}

const PostingListQueryContext = createContext<PostingListQueryContextValue | null>(null)

type PostingListQueryProviderProps = {
  children: ReactNode
}

// useSearchParams 사용으로 Suspense 안에서만 렌더링 가능
function PostingListQueryProvider({ children }: PostingListQueryProviderProps) {
  const pathname = usePathname()
  const query = parsePostingListQuery(useSearchParams())
  const router = useRouter()

  const [, startTransition] = useTransition()
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query)
  const search = useDebouncedSearch(query.keyword, (keyword) => changeQuery({ keyword }))

  function changeQuery(change: PostingListQueryChange) {
    search.cancelPendingSearch()
    // 조건이 바뀌면 이전 페이지 번호가 의미 없어 1페이지로 이동
    const nextQuery = { ...optimisticQuery, keyword: search.keyword, ...change, page: 1 }

    startTransition(() => {
      setOptimisticQuery(nextQuery)
      router.push(getPostingListHref(pathname, nextQuery), { scroll: false })
    })
  }

  function getPageHref(page: number) {
    return getPostingListHref(pathname, { ...optimisticQuery, page })
  }

  function navigateToPage(href: Route) {
    search.discardDraft()
    router.push(href)
  }

  return (
    <PostingListQueryContext
      value={{
        query: optimisticQuery,
        keyword: search.keyword,
        changeQuery,
        changeKeyword: search.changeKeyword,
        getPageHref,
        navigateToPage,
      }}
    >
      {children}
    </PostingListQueryContext>
  )
}

function usePostingListQuery() {
  const context = use(PostingListQueryContext)

  if (!context) {
    throw new Error('usePostingListQuery는 PostingListQueryProvider 안에서 사용')
  }

  return context
}

export { PostingListQueryProvider, usePostingListQuery }

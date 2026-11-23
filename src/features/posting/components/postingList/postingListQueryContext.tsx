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

type QueryNavigation = 'push' | 'replace'

type PostingListQueryContextValue = {
  query: PostingListQuery
  // URL 반영 전 입력 중인 글자 포함
  keyword: string
  changeQuery: (change: PostingListQueryChange) => void
  changeKeyword: (keyword: string) => void
  submitKeyword: () => void
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
  const search = useDebouncedSearch(query.keyword, searchKeyword)

  function changeQuery(change: PostingListQueryChange, navigation: QueryNavigation = 'push') {
    search.cancelPendingSearch()
    const mergedQuery = { ...optimisticQuery, keyword: search.keyword, ...change }
    // 조건이 바뀌면 이전 페이지 번호가 의미 없어 1페이지로 이동
    const nextQuery = { ...mergedQuery, keyword: mergedQuery.keyword.trim(), page: 1 }

    startTransition(() => {
      setOptimisticQuery(nextQuery)
      router[navigation](getPostingListHref(pathname, nextQuery), { scroll: false })
    })
  }

  // 검색 시작·종료만 기록에 남기고, 이어서 고치는 검색어는 현재 기록 교체
  function searchKeyword(keyword: string) {
    const nextKeyword = keyword.trim()

    if (nextKeyword === optimisticQuery.keyword) {
      return
    }

    const isEditingSearch = optimisticQuery.keyword !== '' && nextKeyword !== ''
    changeQuery({ keyword }, isEditingSearch ? 'replace' : 'push')
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
        submitKeyword: search.flushPendingSearch,
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

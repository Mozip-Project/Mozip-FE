'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, use, useOptimistic, useState, useTransition, type ReactNode } from 'react'
import type { PostingListQuery } from '@/features/posting/types'
import {
  getPostingListHref,
  parsePostingListQuery,
} from '@/features/posting/utils/postingListQuery'
import { useDebounce } from '@/hooks/useDebounce'

type PostingListQueryChange = Partial<Omit<PostingListQuery, 'page'>>

type PostingListQueryContextValue = {
  query: PostingListQuery
  // URL 반영 전 입력 중인 글자 포함
  keyword: string
  changeQuery: (change: PostingListQueryChange) => void
  changeKeyword: (keyword: string) => void
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
  const [draftKeyword, setDraftKeyword] = useState<string | null>(null)

  const keyword = draftKeyword ?? optimisticQuery.keyword
  const searchDebounce = useDebounce()

  // URL에 반영되면 뒤로 가기 등 이후 주소 변경을 따르도록 입력값 해제
  if (draftKeyword === query.keyword) {
    setDraftKeyword(null)
  }

  function changeQuery(change: PostingListQueryChange) {
    searchDebounce.cancel()
    // 조건이 바뀌면 이전 페이지 번호가 의미 없어 1페이지로 이동
    const nextQuery = { ...optimisticQuery, keyword, ...change, page: 1 }

    startTransition(() => {
      setOptimisticQuery(nextQuery)
      router.push(getPostingListHref(pathname, nextQuery), { scroll: false })
    })
  }

  // 검색어를 모두 지우면 기다리지 않고 전체 목록으로 복귀
  function changeKeyword(nextKeyword: string) {
    setDraftKeyword(nextKeyword)

    if (nextKeyword === '') {
      changeQuery({ keyword: nextKeyword })
      return
    }

    searchDebounce.schedule(() => changeQuery({ keyword: nextKeyword }))
  }

  return (
    <PostingListQueryContext
      value={{ query: optimisticQuery, keyword, changeQuery, changeKeyword }}
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

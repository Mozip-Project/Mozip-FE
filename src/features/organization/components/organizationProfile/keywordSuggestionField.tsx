'use client'

import { useState } from 'react'
import { useKeywordSuggestionsQuery } from '@/features/organization/api/organizer/queries'
import { useDebounce } from '@/hooks/useDebounce'
import { KeywordField } from './keywordField'

type KeywordSuggestionFieldProps = {
  value: string[]
  onChange: (keywords: string[]) => void
}

// 입력을 멈춘 뒤 추천을 조회해 입력할 때마다 요청하지 않음
function KeywordSuggestionField({ value, onChange }: KeywordSuggestionFieldProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const queryDebounce = useDebounce()
  const suggestionsQuery = useKeywordSuggestionsQuery(debouncedQuery)

  // 기다리는 동안 남은 이전 입력어의 결과는 현재 입력어로 시작하는 것만 표시
  const normalizedQuery = query.trim().toLowerCase()
  const suggestions = (suggestionsQuery.data ?? []).filter((suggestion) =>
    suggestion.toLowerCase().startsWith(normalizedQuery),
  )

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery)
    queryDebounce.schedule(() => setDebouncedQuery(nextQuery))
  }

  return (
    <KeywordField
      value={value}
      onChange={onChange}
      suggestions={suggestions}
      onQueryChange={handleQueryChange}
    />
  )
}

export { KeywordSuggestionField }

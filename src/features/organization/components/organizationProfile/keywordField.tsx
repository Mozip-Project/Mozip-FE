'use client'

import { useId, useState, type KeyboardEvent } from 'react'
import { RemovableChip } from '@/components/ui/Chip/removableChip'
import { KEYWORD_MAX_COUNT } from '@/features/organization/schemas/organizationProfileSchema'
import { addKeyword } from '@/features/organization/utils/keywords'
import { cn } from '@/lib/utils'
import { KeywordMenu } from './keywordMenu'

type KeywordFieldProps = {
  value: string[]
  onChange: (keywords: string[]) => void
  suggestions: readonly string[]
}

function KeywordField({ value: keywords, onChange, suggestions }: KeywordFieldProps) {
  const inputId = useId()
  const listboxId = useId()
  const maxHelperId = useId()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isMenuDismissed, setIsMenuDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const trimmedQuery = query.trim()
  const visibleSuggestions = suggestions.filter((suggestion) => !keywords.includes(suggestion))
  const directAddIndex = visibleSuggestions.length
  const isAtMaxCount = keywords.length >= KEYWORD_MAX_COUNT
  const isMenuOpen = isFocused && !isMenuDismissed && !isAtMaxCount && trimmedQuery !== ''
  const getOptionId = (index: number) => `${listboxId}-${index}`

  function selectKeyword(keyword: string) {
    onChange(addKeyword(keywords, keyword, KEYWORD_MAX_COUNT))
    setQuery('')
    setActiveIndex(-1)
  }

  function removeKeyword(keyword: string) {
    onChange(keywords.filter((item) => item !== keyword))
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setIsMenuDismissed(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 한글 조합 중 Enter의 중복 추가 방지
    if (event.nativeEvent.isComposing) {
      return
    }

    // 메뉴가 닫혀 있어도 Enter는 폼 제출 대신 키워드 추가
    if (event.key === 'Enter') {
      event.preventDefault()
      const activeSuggestion = isMenuOpen ? visibleSuggestions[activeIndex] : undefined
      selectKeyword(activeSuggestion ?? trimmedQuery)
      return
    }

    if (!isMenuOpen) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => (index >= directAddIndex ? 0 : index + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => (index <= 0 ? directAddIndex : index - 1))
        break
      case 'Escape':
        setIsMenuDismissed(true)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div className="flex flex-col gap-gap-s">
      <label htmlFor={inputId} className="flex w-fit gap-gap-xs text-label1 font-semibold">
        <span className="text-neutral">검색 키워드 (최대 {KEYWORD_MAX_COUNT}개)</span>
        <span aria-hidden className="text-critical">
          *
        </span>
      </label>
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-gap-s gap-y-gap-xs rounded-m border border-neutral-weak bg-layer-default px-padding-m',
          'transition-colors focus-within:border-neutral-solid motion-reduce:transition-none',
          keywords.length > 0 ? 'min-h-13 py-padding-xs' : 'h-12',
        )}
      >
        {keywords.map((keyword) => (
          <RemovableChip
            key={keyword}
            removeLabel={`${keyword} 삭제`}
            onRemove={() => removeKeyword(keyword)}
          >
            {keyword}
          </RemovableChip>
        ))}
        <input
          id={inputId}
          role="combobox"
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            isMenuOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined
          }
          aria-required
          aria-describedby={isAtMaxCount ? maxHelperId : undefined}
          value={query}
          placeholder={
            keywords.length > 0 ? undefined : '키워드 입력 후 Enter를 눌러 추가해 주세요'
          }
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-5.5 w-0 min-w-12 flex-1 bg-transparent text-body2 text-neutral outline-none placeholder:text-placeholder"
        />
      </div>
      {isAtMaxCount && (
        <p id={maxHelperId} className="text-label2 font-normal text-critical">
          키워드는 최대 {KEYWORD_MAX_COUNT}개까지 등록 가능해요
        </p>
      )}
      {isMenuOpen && (
        <KeywordMenu
          id={listboxId}
          suggestions={visibleSuggestions}
          query={trimmedQuery}
          activeIndex={activeIndex}
          getOptionId={getOptionId}
          onSelect={selectKeyword}
        />
      )}
    </div>
  )
}

export { KeywordField }

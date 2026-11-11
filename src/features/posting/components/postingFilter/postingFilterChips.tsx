'use client'

import { useRef } from 'react'
import RefreshIcon from '@/assets/icons/refresh.svg'
import { Button } from '@/components/ui/Button/button'
import { RemovableChip } from '@/components/ui/Chip/removableChip'
import { usePostingListQuery } from '@/features/posting/components/postingList/postingListQueryContext'
import {
  POSTING_ACTIVITY_FIELD_LABEL,
  POSTING_ACTIVITY_TYPE_LABEL,
  POSTING_SCOPE_LABEL,
} from '@/features/posting/types'

function PostingFilterChips() {
  const { query, changeQuery } = usePostingListQuery()
  const { scopes, activityTypes, activityFields } = query
  const listRef = useRef<HTMLUListElement>(null)

  const appliedFilters = [
    ...scopes.map((scope) => ({
      id: `scope-${scope}`,
      label: POSTING_SCOPE_LABEL[scope],
      onRemove: () => changeQuery({ scopes: scopes.filter((value) => value !== scope) }),
    })),
    ...activityTypes.map((type) => ({
      id: `type-${type}`,
      label: POSTING_ACTIVITY_TYPE_LABEL[type],
      onRemove: () =>
        changeQuery({ activityTypes: activityTypes.filter((value) => value !== type) }),
    })),
    ...activityFields.map((field) => ({
      id: `field-${field}`,
      label: POSTING_ACTIVITY_FIELD_LABEL[field],
      onRemove: () =>
        changeQuery({ activityFields: activityFields.filter((value) => value !== field) }),
    })),
  ]

  if (appliedFilters.length === 0) {
    return null
  }

  // 칩 줄이 사라지면 바로 위 정렬 버튼으로 이동
  function focusSortControl() {
    listRef.current
      ?.closest('section')
      ?.querySelector<HTMLElement>('[data-slot="filter-select"]')
      ?.focus()
  }

  // 누른 버튼이 사라져 focus가 문서 처음으로 가지 않도록 남는 칩으로 먼저 이동
  function handleRemove(index: number, onRemove: () => void) {
    const removeButtons = Array.from(listRef.current?.querySelectorAll('button') ?? [])
    const nextFocusTarget = removeButtons[index + 1] ?? removeButtons[index - 1]

    if (nextFocusTarget) {
      nextFocusTarget.focus()
    } else {
      focusSortControl()
    }

    onRemove()
  }

  function handleReset() {
    focusSortControl()
    changeQuery({ scopes: [], activityTypes: [], activityFields: [] })
  }

  return (
    <div className="flex flex-wrap items-center gap-gap-s">
      <ul ref={listRef} aria-label="적용된 필터" className="flex flex-wrap gap-gap-s">
        {appliedFilters.map((filter, index) => (
          <li key={filter.id}>
            <RemovableChip
              tone="brand"
              onRemove={() => handleRemove(index, filter.onRemove)}
              removeLabel={`${filter.label} 필터 해제`}
            >
              {filter.label}
            </RemovableChip>
          </li>
        ))}
      </ul>
      <Button variant="tertiary" size="s" onClick={handleReset}>
        <RefreshIcon aria-hidden />
        <span className="sr-only">필터 </span>
        초기화
      </Button>
    </div>
  )
}

export { PostingFilterChips }

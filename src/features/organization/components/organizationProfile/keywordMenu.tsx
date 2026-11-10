import PlusIcon from '@/assets/icons/plus.svg'
import { MENU_ITEM_BASE_CLASS } from '@/components/ui/DropdownMenu/dropdownMenu'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type KeywordMenuProps = {
  id: string
  suggestions: readonly string[]
  query: string
  // 0부터 추천 키워드, suggestions.length가 직접 추가
  activeIndex: number
  getOptionId: (index: number) => string
  onSelect: (keyword: string) => void
}

function KeywordMenu({
  id,
  suggestions,
  query,
  activeIndex,
  getOptionId,
  onSelect,
}: KeywordMenuProps) {
  const directAddIndex = suggestions.length

  return (
    <ul
      id={id}
      role="listbox"
      aria-label="검색 키워드 추천"
      className="flex flex-col gap-gap-xxs rounded-m border border-neutral-muted bg-layer-default p-padding-xs shadow-floating"
    >
      {suggestions.map((suggestion, index) => (
        <KeywordOption
          key={suggestion}
          id={getOptionId(index)}
          isActive={index === activeIndex}
          onSelect={() => onSelect(suggestion)}
        >
          {suggestion}
        </KeywordOption>
      ))}
      {suggestions.length > 0 && (
        <li role="presentation" className="my-gap-xs border-t border-neutral-subtle" />
      )}
      <KeywordOption
        id={getOptionId(directAddIndex)}
        isActive={directAddIndex === activeIndex}
        onSelect={() => onSelect(query)}
      >
        <PlusIcon aria-hidden className="size-5 shrink-0" />“{query}” 직접 추가
      </KeywordOption>
    </ul>
  )
}

type KeywordOptionProps = {
  id: string
  isActive: boolean
  onSelect: () => void
  children: ReactNode
}

function KeywordOption({ id, isActive, onSelect, children }: KeywordOptionProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      // 클릭 중 input blur로 메뉴가 닫히지 않게 유지
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(MENU_ITEM_BASE_CLASS, 'hover:bg-neutral-weak aria-selected:bg-neutral-weak')}
    >
      {children}
    </li>
  )
}

export { KeywordMenu }

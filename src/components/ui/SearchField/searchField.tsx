'use client'

import { useRef, type ComponentProps } from 'react'
import CloseIcon from '@/assets/icons/close.svg'
import SearchIcon from '@/assets/icons/search.svg'
import { cn } from '@/lib/utils'
import { SEARCH_FIELD_SIZE_CLASS, type SearchFieldSize } from './searchField.variants'

type SearchFieldProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'ref'
> & {
  'aria-label': string
  value: string
  onValueChange: (value: string) => void
  size?: SearchFieldSize
}

function SearchField({ className, size = 'l', value, onValueChange, ...props }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sizeClass = SEARCH_FIELD_SIZE_CLASS[size]
  const canClear = value !== '' && !props.disabled && !props.readOnly

  function handleClear() {
    onValueChange('')

    // 사라지는 지우기 버튼 대신 입력으로 focus 복귀
    inputRef.current?.focus()
  }

  return (
    <div
      data-slot="search-field"
      className={cn(
        'flex items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default',
        'transition-colors focus-within:border-neutral-solid motion-reduce:transition-none',
        sizeClass.field,
        canClear && sizeClass.endPadding,
        className,
      )}
    >
      {/* 지우기 버튼은 label 밖에 두고, 아이콘·여백 클릭 시 입력창 포커스 유지 */}
      <label
        className={cn(
          'flex h-full min-w-0 flex-1 cursor-text items-center gap-gap-s',
          sizeClass.label,
          !canClear && sizeClass.endPadding,
        )}
      >
        <SearchIcon aria-hidden className={cn('shrink-0 text-neutral-subtle', sizeClass.icon)} />
        <input
          ref={inputRef}
          type="search"
          data-slot="search-field-input"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className={cn(
            'h-full min-w-0 flex-1 truncate bg-transparent text-neutral outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none',
            sizeClass.input,
          )}
          {...props}
        />
      </label>
      {canClear && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={handleClear}
          className={cn(
            'relative flex shrink-0 cursor-pointer items-center justify-center rounded-xs text-neutral-subtle',
            'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring focus-visible:outline-solid',
            'after:absolute after:-inset-2',
          )}
        >
          <CloseIcon aria-hidden className={sizeClass.icon} />
        </button>
      )}
    </div>
  )
}

export { SearchField }

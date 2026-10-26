import SearchIcon from '@/assets/icons/search.svg'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type SearchFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  'aria-label': string
}

function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <label
      data-slot="search-field"
      className={cn(
        'flex h-13 cursor-text items-center gap-gap-s rounded-m border border-neutral-muted bg-layer-default px-padding-m',
        'transition-colors focus-within:border-neutral-solid motion-reduce:transition-none',
        className,
      )}
    >
      <SearchIcon aria-hidden className="size-5 shrink-0 text-neutral-subtle" />
      <input
        type="search"
        data-slot="search-field-input"
        className="h-full w-full min-w-0 bg-transparent text-body2 font-normal text-neutral outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
    </label>
  )
}

export { SearchField }

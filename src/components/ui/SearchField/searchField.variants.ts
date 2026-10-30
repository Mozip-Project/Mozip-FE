export const SEARCH_FIELD_SIZES = ['l', 's'] as const

export type SearchFieldSize = (typeof SEARCH_FIELD_SIZES)[number]

type SearchFieldSizeClass = {
  field: string
  label: string
  endPadding: string
  icon: string
  input: string
}

export const SEARCH_FIELD_SIZE_CLASS = {
  l: {
    field: 'h-13',
    label: 'pl-padding-m',
    endPadding: 'pr-padding-m',
    icon: 'size-5',
    input: 'text-body2 font-normal',
  },
  s: {
    field: 'h-9',
    label: 'pl-padding-s',
    endPadding: 'pr-padding-s',
    icon: 'size-4',
    input: 'text-label1 font-medium',
  },
} satisfies Record<SearchFieldSize, SearchFieldSizeClass>

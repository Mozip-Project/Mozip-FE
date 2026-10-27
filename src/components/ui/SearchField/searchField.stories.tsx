import { useState } from 'react'
import { SearchField } from './searchField'
import { SEARCH_FIELD_SIZES, type SearchFieldSize } from './searchField.variants'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SearchField',
  component: SearchField,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SearchField>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

// Figma 기준 폭: L 360px, S 220px
const WIDTH_CLASS = {
  l: 'w-90',
  s: 'w-55',
} satisfies Record<SearchFieldSize, string>

const PLACEHOLDER = '단체명 또는 키워드를 검색해 주세요'

function SearchFieldPreview({
  size,
  initialValue,
}: {
  size: SearchFieldSize
  initialValue: string
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <SearchField
      size={size}
      className={WIDTH_CLASS[size]}
      aria-label="단체 검색"
      placeholder={PLACEHOLDER}
      value={value}
      onValueChange={setValue}
    />
  )
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      {SEARCH_FIELD_SIZES.map((size) => (
        <div key={size} className="flex flex-col gap-gap-m">
          <SearchFieldPreview size={size} initialValue="" />
          <SearchFieldPreview size={size} initialValue={PLACEHOLDER} />
        </div>
      ))}
    </div>
  ),
}

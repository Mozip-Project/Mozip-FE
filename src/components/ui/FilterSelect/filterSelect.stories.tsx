import { useState } from 'react'
import SortIcon from '@/assets/icons/sort.svg'
import { FilterSelect } from './filterSelect'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/FilterSelect',
  component: FilterSelect,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof FilterSelect>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'deadline', label: '마감 임박순' },
  { value: 'popular', label: '인기순 (스크랩 많은 순)' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

function FilterSelectPreview() {
  const [sort, setSort] = useState<SortValue>('latest')

  return (
    <div className="flex w-120 justify-end">
      <FilterSelect
        label="정렬"
        icon={<SortIcon aria-hidden />}
        options={SORT_OPTIONS}
        value={sort}
        onValueChange={setSort}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <FilterSelectPreview />,
}

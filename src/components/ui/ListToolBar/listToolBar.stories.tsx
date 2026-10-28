import { useState } from 'react'
import { SearchField } from '@/components/ui/SearchField/searchField'
import { MultiSelectMenu } from '@/components/ui/SelectMenu/multiSelectMenu'
import { SelectMenu } from '@/components/ui/SelectMenu/selectMenu'
import { ListToolBar } from './listToolBar'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ListToolBar',
  component: ListToolBar,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ListToolBar>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const POSITION_OPTIONS = [
  { value: 'design', label: '디자인', count: 20 },
  { value: 'development', label: '개발', count: 22 },
  { value: 'planning', label: '기획', count: 6 },
] as const

const SORT_OPTIONS = [
  { value: 'submittedDesc', label: '제출일 최신순' },
  { value: 'submittedAsc', label: '제출일 오래된 순' },
  { value: 'nameAsc', label: '이름 가나다순' },
  { value: 'nameDesc', label: '이름 역순' },
] as const

type PositionValue = (typeof POSITION_OPTIONS)[number]['value']
type SortValue = (typeof SORT_OPTIONS)[number]['value']

function ListToolBarPreview() {
  const [positions, setPositions] = useState<PositionValue[]>(
    POSITION_OPTIONS.map((option) => option.value),
  )
  const [sort, setSort] = useState<SortValue>('submittedDesc')
  const [keyword, setKeyword] = useState('')

  return (
    <ListToolBar>
      <MultiSelectMenu
        label="포지션"
        options={POSITION_OPTIONS}
        values={positions}
        onValuesChange={setPositions}
        totalCount={48}
      />
      <SelectMenu label="정렬" options={SORT_OPTIONS} value={sort} onValueChange={setSort} />
      <SearchField
        size="s"
        className="w-55"
        aria-label="지원자 검색"
        placeholder="이름을 검색해 주세요"
        value={keyword}
        onValueChange={setKeyword}
      />
    </ListToolBar>
  )
}

export const Default: Story = {
  render: () => (
    <div className="h-80 p-padding-xl">
      <ListToolBarPreview />
    </div>
  ),
}

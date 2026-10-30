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

const STATUS_TABS = [
  { value: 'all', label: '전체', count: 48 },
  { value: 'pending', label: '내 평가 전', count: 16 },
  { value: 'done', label: '내 평가 완료', count: 32 },
] as const

type PositionValue = (typeof POSITION_OPTIONS)[number]['value']
type SortValue = (typeof SORT_OPTIONS)[number]['value']
type StatusValue = (typeof STATUS_TABS)[number]['value']

function ListToolBarControls() {
  const [positions, setPositions] = useState<PositionValue[]>(
    POSITION_OPTIONS.map((option) => option.value),
  )
  const [sort, setSort] = useState<SortValue>('submittedDesc')
  const [keyword, setKeyword] = useState('')

  return (
    <>
      <MultiSelectMenu
        label="포지션"
        options={POSITION_OPTIONS}
        values={positions}
        onValuesChange={setPositions}
        totalCount={48}
        minSelectionMessage="포지션을 1개 이상 선택해 주세요"
      />
      <SelectMenu label="정렬" options={SORT_OPTIONS} value={sort} onValueChange={setSort} />
      <SearchField
        size="s"
        className="w-55"
        aria-label="지원자 검색"
        placeholder="이름 검색"
        value={keyword}
        onValueChange={setKeyword}
      />
    </>
  )
}

function ListToolBarPreview() {
  const [status, setStatus] = useState<StatusValue>('all')
  const statusLabel = STATUS_TABS.find((tab) => tab.value === status)?.label

  return (
    <ListToolBar
      tabs={STATUS_TABS}
      tabsLabel="지원자 평가 상태"
      value={status}
      onValueChange={setStatus}
      controls={<ListToolBarControls />}
    >
      <p className="pt-padding-m text-body2">{statusLabel} 지원자 목록</p>
    </ListToolBar>
  )
}

// Figma 기준 폭 940px, 선택값 길이에 따라 툴바 전체 폭이 바뀌지 않도록 고정
export const Default: Story = {
  render: () => (
    <div className="h-80 w-235">
      <ListToolBarPreview />
    </div>
  ),
}

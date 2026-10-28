import { useState } from 'react'
import RefreshIcon from '@/assets/icons/refresh.svg'
import { SelectMenu, SelectMenuAction } from './selectMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SelectMenu',
  component: SelectMenu,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SelectMenu>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const SORT_OPTIONS = [
  { value: 'submittedDesc', label: '제출일 최신순' },
  { value: 'submittedAsc', label: '제출일 오래된 순' },
  { value: 'nameAsc', label: '이름 가나다순' },
  { value: 'nameDesc', label: '이름 역순' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

function SelectMenuPreview() {
  const [sort, setSort] = useState<SortValue>('submittedDesc')

  return <SelectMenu label="정렬" options={SORT_OPTIONS} value={sort} onValueChange={setSort} />
}

export const Default: Story = {
  render: () => (
    <div className="h-80 p-padding-xl">
      <SelectMenuPreview />
    </div>
  ),
}

function SelectMenuWithActionsPreview() {
  const [sort, setSort] = useState<SortValue>('submittedDesc')

  return (
    <SelectMenu
      label="정렬"
      groupLabel="내 단체"
      options={SORT_OPTIONS}
      value={sort}
      onValueChange={setSort}
      actions={
        <>
          <SelectMenuAction href="/">
            <RefreshIcon aria-hidden />새 단체 등록
          </SelectMenuAction>
          <SelectMenuAction href="/">
            <RefreshIcon aria-hidden />
            기존 단체 대표 인수
          </SelectMenuAction>
        </>
      }
    />
  )
}

export const WithActions: Story = {
  render: () => (
    <div className="h-100 p-padding-xl">
      <SelectMenuWithActionsPreview />
    </div>
  ),
}

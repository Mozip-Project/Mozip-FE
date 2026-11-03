import { TableCell, TableHeadAction, TableHeadCell } from './table'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

const meta = {
  title: 'UI/Table',
  component: TableCell,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof TableCell>

export default meta
type Story = StoryObj

function ExampleRow({ children }: { children: ReactNode }) {
  return (
    <div role="table" aria-label="예시 표">
      <div role="row" className="flex items-center gap-gap-xl">
        {children}
      </div>
    </div>
  )
}

function HeadActions() {
  return (
    <>
      <TableHeadAction icon="info" label="라벨 설명 보기" />
      <TableHeadAction icon="sort" label="라벨 정렬" />
      <TableHeadAction icon="filter" label="라벨 필터" />
    </>
  )
}

export const HeadCells: Story = {
  render: () => (
    <ExampleRow>
      <TableHeadCell actions={<HeadActions />} className="w-40">
        라벨
      </TableHeadCell>
      <TableHeadCell align="right" actions={<HeadActions />} className="w-40">
        라벨
      </TableHeadCell>
    </ExampleRow>
  ),
}

export const Cells: Story = {
  render: () => (
    <ExampleRow>
      <TableCell type="text" className="w-40">
        텍스트
      </TableCell>
      <TableCell type="name" className="w-40">
        김모집
      </TableCell>
      <TableCell type="badge" className="w-40">
        디자인
      </TableCell>
    </ExampleRow>
  ),
}

export const Overflow: Story = {
  render: () => (
    <ExampleRow>
      <TableCell type="text" className="w-40">
        아주 긴 텍스트가 들어가면 한 줄로 말줄임
      </TableCell>
      <TableCell type="name" className="w-40">
        아주긴이름을가진지원자이름
      </TableCell>
    </ExampleRow>
  ),
}

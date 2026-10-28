import { useState } from 'react'
import { MultiSelectMenu } from './multiSelectMenu'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SelectMenu/MultiSelectMenu',
  component: MultiSelectMenu,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof MultiSelectMenu>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

const POSITION_OPTIONS = [
  { value: 'design', label: '디자인', count: 20 },
  { value: 'development', label: '개발', count: 22 },
  { value: 'planning', label: '기획', count: 6 },
] as const

type PositionValue = (typeof POSITION_OPTIONS)[number]['value']

function MultiSelectMenuPreview({ initialValues }: { initialValues: PositionValue[] }) {
  const [positions, setPositions] = useState(initialValues)

  return (
    <MultiSelectMenu
      label="포지션"
      options={POSITION_OPTIONS}
      values={positions}
      onValuesChange={setPositions}
      totalCount={48}
    />
  )
}

export const Default: Story = {
  render: () => (
    <div className="flex h-80 gap-gap-xxl p-padding-xl">
      <MultiSelectMenuPreview initialValues={['design', 'development', 'planning']} />
      <MultiSelectMenuPreview initialValues={['design']} />
      <MultiSelectMenuPreview initialValues={['design', 'development']} />
      <MultiSelectMenuPreview initialValues={[]} />
    </div>
  ),
}

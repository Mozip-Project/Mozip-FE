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

type MultiSelectMenuPreviewProps = {
  initialValues: PositionValue[]
  groupLabel?: string
}

function MultiSelectMenuPreview({ initialValues, groupLabel }: MultiSelectMenuPreviewProps) {
  const [positions, setPositions] = useState(initialValues)

  return (
    <MultiSelectMenu
      label="포지션"
      options={POSITION_OPTIONS}
      values={positions}
      onValuesChange={setPositions}
      totalCount={48}
      groupLabel={groupLabel}
      minSelectionMessage="포지션을 1개 이상 선택해 주세요"
    />
  )
}

// 두 번째 메뉴는 남은 1개를 해제해 오류 흔들림 확인용
export const Default: Story = {
  render: () => (
    <div className="flex h-80 gap-gap-xxl p-padding-xl">
      <MultiSelectMenuPreview initialValues={['design', 'development', 'planning']} />
      <MultiSelectMenuPreview initialValues={['design']} />
    </div>
  ),
}

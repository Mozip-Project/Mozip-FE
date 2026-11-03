import { ScoreRow } from './scoreRow'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ScoreRow',
  component: ScoreRow,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ScoreRow>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <ScoreRow label="Q1. 지원 동기" className="w-87.5 max-w-full" />,
}

export const Selected: Story = {
  render: () => <ScoreRow label="Q1. 지원 동기" defaultValue="4" className="w-87.5 max-w-full" />,
}

export const Error: Story = {
  render: () => (
    <ScoreRow
      label="Q1. 지원 동기"
      errorMessage="점수를 선택해 주세요"
      className="w-87.5 max-w-full"
    />
  ),
}

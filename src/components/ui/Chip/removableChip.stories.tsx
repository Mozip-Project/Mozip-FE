import { useState } from 'react'
import { RemovableChip } from './removableChip'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Chip/RemovableChip',
  component: RemovableChip,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof RemovableChip>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <RemovableChip onRemove={() => {}} removeLabel="칩 삭제">
      칩
    </RemovableChip>
  ),
}

const KEYWORDS = ['UX', '디자인', '피그마']

function KeywordList() {
  const [keywords, setKeywords] = useState(KEYWORDS)

  return (
    <div className="flex flex-wrap gap-gap-s">
      {keywords.map((keyword) => (
        <RemovableChip
          key={keyword}
          onRemove={() => setKeywords((prev) => prev.filter((item) => item !== keyword))}
          removeLabel={`${keyword} 삭제`}
        >
          {keyword}
        </RemovableChip>
      ))}
    </div>
  )
}

export const Keywords: Story = {
  render: () => <KeywordList />,
}

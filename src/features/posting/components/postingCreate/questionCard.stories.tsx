import { ActionMenu } from '@/components/ui/ActionMenu/actionMenu'
import { DropdownMenuItem } from '@/components/ui/DropdownMenu/dropdownMenu'
import { ActivityAnswerPreview } from './activityAnswerPreview'
import { FileAnswerPreview } from './fileAnswerPreview'
import { QuestionCard } from './questionCard'
import { TextAnswerPreview } from './textAnswerPreview'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Posting/QuestionCard',
  component: QuestionCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-147">
        <Story />
      </div>
    ),
  ],
  args: {
    index: 1,
    title: '장문형',
    description: '설명을 입력해 주세요',
    required: true,
    isSelected: false,
    children: <TextAnswerPreview maxLength={500} />,
  },
} satisfies Meta<typeof QuestionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {}

export const Selected: Story = {
  args: {
    title: 'UXUX에 지원한 동기를 작성해 주세요.',
    isSelected: true,
    actions: (
      <ActionMenu label="Q1 질문 메뉴">
        <DropdownMenuItem>복제</DropdownMenuItem>
        <DropdownMenuItem>삭제</DropdownMenuItem>
      </ActionMenu>
    ),
  },
}

export const Activity: Story = {
  args: { title: '활동 경험', children: <ActivityAnswerPreview /> },
}

export const File: Story = {
  args: {
    title: '파일 첨부 또는 URL',
    children: (
      <FileAnswerPreview
        acceptedTypes={['application/pdf']}
        maxSizeBytes={10 * 1024 * 1024}
        fileDescription="10MB 이하"
        guide="파일 형식에 대한 설명이 들어가는 자리입니다"
      />
    ),
  },
}

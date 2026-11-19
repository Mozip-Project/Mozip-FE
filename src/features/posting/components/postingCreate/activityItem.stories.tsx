import { TextField } from '@/components/ui/TextField/textField'
import { ActivityItem } from './activityItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Features/Posting/ActivityItem',
  component: ActivityItem,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-125">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '활동 경험 1',
    collapsedTitle: 'UXUX 디자인 동아리',
    onRemove: () => undefined,
    children: (
      <>
        <TextField label="활동명" placeholder="활동명을 입력해 주세요" />
        <div className="flex gap-gap-m">
          <TextField className="min-w-0 flex-1" label="활동 기간" placeholder="YYYY.MM ~ YYYY.MM" />
          <TextField className="min-w-0 flex-1" label="역할" placeholder="담당 역할" />
        </div>
        <TextField label="주요 성과" placeholder="성과를 입력해 주세요" />
      </>
    ),
  },
} satisfies Meta<typeof ActivityItem>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {}

export const Collapsed: Story = { args: { defaultOpen: false } }

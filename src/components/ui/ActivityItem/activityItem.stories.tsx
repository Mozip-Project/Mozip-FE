import { TextField } from '@/components/ui/TextField/textField'
import { ActivityItem } from './activityItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/ActivityItem',
  component: ActivityItem,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof ActivityItem>

export default meta
type Story = StoryObj

function ignoreRemove() {}

function ActivityFields() {
  return (
    <>
      <TextField label="활동명" placeholder="활동명을 입력해 주세요" />
      <div className="flex gap-gap-m">
        <TextField className="min-w-0 flex-1" label="활동 기간" placeholder="YYYY.MM ~ YYYY.MM" />
        <TextField className="min-w-0 flex-1" label="역할" placeholder="담당 역할" />
      </div>
      <TextField label="주요 성과" placeholder="성과를 입력해 주세요" />
    </>
  )
}

export const States: Story = {
  render: () => (
    <div className="flex max-w-125 flex-col gap-gap-m">
      <ActivityItem title="활동 경험 1" onRemove={ignoreRemove}>
        <ActivityFields />
      </ActivityItem>
      <ActivityItem
        title="활동 경험 2"
        collapsedTitle="UXUX 디자인 동아리"
        defaultOpen={false}
        onRemove={ignoreRemove}
      >
        <ActivityFields />
      </ActivityItem>
    </div>
  ),
}

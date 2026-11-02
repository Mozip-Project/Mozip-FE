import { NotificationItem } from './notificationItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Notification/NotificationItem',
  component: NotificationItem,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof NotificationItem>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const States: Story = {
  render: () => (
    <div className="flex w-100 flex-col">
      <NotificationItem
        isRead={false}
        source="UXUX"
        title="모집 기간이 10월 20일까지 연장됐어요"
        meta="3일 전"
      />
      <NotificationItem
        isRead
        source="UXUX"
        title="모집 기간이 10월 20일까지 연장됐어요"
        meta="3일 전"
      />
    </div>
  ),
}

export const LongTitle: Story = {
  render: () => (
    <div className="flex w-100 flex-col">
      <NotificationItem
        isRead={false}
        source="아주 긴 이름을 가진 동아리"
        title="모집 기간이 10월 20일까지 연장됐어요. 지원서를 제출하기 전에 변경된 일정을 꼭 확인해 주세요"
        meta="3일 전"
      />
      <NotificationItem
        isRead
        source="아주 긴 이름을 가진 동아리"
        title="모집 기간이 10월 20일까지 연장됐어요. 지원서를 제출하기 전에 변경된 일정을 꼭 확인해 주세요"
        meta="3일 전"
      />
    </div>
  ),
}

import { NotificationPanel, type NotificationEntry } from './notificationPanel'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

const NOTIFICATIONS: NotificationEntry[] = [
  {
    id: '1',
    audience: 'organizer',
    href: '/manage/mypage',
    isRead: false,
    source: 'UXUX',
    title: '대표자 요청이 도착했어요',
    meta: '방금',
  },
  {
    id: '2',
    audience: 'organizer',
    href: '/manage/mypage',
    isRead: false,
    source: 'UXUX',
    title: '대표자 신청이 승인되었어요',
    meta: '방금',
  },
  {
    id: '3',
    audience: 'organizer',
    href: '/manage/mypage',
    isRead: false,
    source: '멋쟁이개발자',
    title: '대표자 신청이 거절되었어요',
    meta: '1시간 전',
  },
  {
    id: '4',
    audience: 'organizer',
    href: '/manage/mypage',
    isRead: true,
    source: '밴드 소리샘',
    title: '대표자 신청이 승인되었어요',
    meta: '어제',
  },
  {
    id: '5',
    audience: 'applicant',
    href: '/manage/mypage',
    isRead: true,
    source: 'UXUX',
    title: '모집 기간이 10월 20일까지 연장됐어요',
    meta: '3일 전',
  },
]

const MANY_NOTIFICATIONS: NotificationEntry[] = [
  ...NOTIFICATIONS,
  ...NOTIFICATIONS,
  ...NOTIFICATIONS,
].map((notification, index) => ({ ...notification, id: String(index) }))

function PanelFrame({ children }: { children: ReactNode }) {
  return <div className="flex h-170 w-100 justify-end">{children}</div>
}

const meta = {
  title: 'Features/Notification/NotificationPanel',
  component: NotificationPanel,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof NotificationPanel>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const List: Story = {
  render: () => (
    <PanelFrame>
      <NotificationPanel
        defaultOpen
        notifications={NOTIFICATIONS}
        settingsHref="/manage/mypage/notifications"
      />
    </PanelFrame>
  ),
}

export const Empty: Story = {
  render: () => (
    <PanelFrame>
      <NotificationPanel
        defaultOpen
        notifications={[]}
        settingsHref="/manage/mypage/notifications"
      />
    </PanelFrame>
  ),
}

export const ManyItems: Story = {
  render: () => (
    <PanelFrame>
      <NotificationPanel
        defaultOpen
        notifications={MANY_NOTIFICATIONS}
        settingsHref="/manage/mypage/notifications"
      />
    </PanelFrame>
  ),
}

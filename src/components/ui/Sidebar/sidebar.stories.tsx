import { Sidebar } from './sidebar'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Route } from 'next'

const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="w-55">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj

// 하위 메뉴 경로 미정이라 예시 경로로 표시
export const MyPage: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/mypage/account' } },
  },
  render: () => (
    <Sidebar
      title="마이페이지"
      items={[
        { label: '계정 설정', href: '/mypage/account' as Route },
        { label: '알림 설정', href: '/mypage/notifications' as Route },
      ]}
    />
  ),
}

export const Organization: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/manage/organization/profile' } },
  },
  render: () => (
    <Sidebar
      title="단체 관리"
      items={[
        { label: '단체 프로필', href: '/manage/organization/profile' as Route },
        { label: '운영진 관리', href: '/manage/organization/members' as Route },
        { label: '팀 설정', href: '/manage/organization/teams' as Route },
        { label: '대표자 변경', href: '/manage/organization/owner' as Route },
        { label: '이용권 결제', href: '/manage/organization/billing' as Route },
      ]}
    />
  ),
}

export const NestedPath: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: '/manage/organization/teams' } },
  },
  render: () => (
    <Sidebar
      title="단체 관리"
      items={[
        { label: '단체 프로필', href: '/manage/organization' },
        { label: '팀 설정', href: '/manage/organization/teams' as Route },
      ]}
    />
  ),
}

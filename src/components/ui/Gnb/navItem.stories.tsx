import { NavItem } from './navItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Gnb/NavItem',
  component: NavItem,
  parameters: {
    controls: { disable: true },
    nextjs: { appDirectory: true, navigation: { pathname: '/manage/postings' } },
  },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <nav aria-label="메뉴" className="flex items-center gap-gap-xs">
      <NavItem href="/postings">메뉴</NavItem>
      <NavItem href="/manage/postings">메뉴</NavItem>
      <NavItem href="/manage">메뉴</NavItem>
    </nav>
  ),
}

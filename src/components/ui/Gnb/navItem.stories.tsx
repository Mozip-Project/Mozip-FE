import { NavItem } from './navItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Route } from 'next'

const meta = {
  title: 'UI/Gnb/NavItem',
  component: NavItem,
  parameters: {
    controls: { disable: true },
    nextjs: { appDirectory: true, navigation: { pathname: '/section/page' } },
  },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj

// 실제 route가 아닌 표시용 경로라 typedRoutes 검사를 피하려고 문자열을 Route로 변환
function toStoryRoute(path: string) {
  return path as Route
}

export const Default: Story = {
  render: () => (
    <nav aria-label="메뉴" className="flex items-center gap-gap-xs">
      <NavItem href={toStoryRoute('/other')}>메뉴</NavItem>
      <NavItem href={toStoryRoute('/section/page')}>메뉴</NavItem>
      <NavItem href={toStoryRoute('/section')}>메뉴</NavItem>
    </nav>
  ),
}

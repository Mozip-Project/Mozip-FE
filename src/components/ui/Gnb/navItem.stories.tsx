import { NavItem } from './navItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Gnb/NavItem',
  component: NavItem,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <nav aria-label="메뉴" className="flex items-center gap-gap-xs">
      <NavItem href="/">메뉴</NavItem>
      <NavItem href="/" isActive>
        메뉴
      </NavItem>
    </nav>
  ),
}

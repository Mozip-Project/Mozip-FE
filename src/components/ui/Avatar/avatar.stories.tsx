import { Avatar } from './avatar'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-gap-xl">
      <Avatar size={28} />
      <Avatar size={40} />
      <Avatar size={48} />
      <Avatar size={72} />
    </div>
  ),
}

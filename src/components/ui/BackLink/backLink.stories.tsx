import { BackLink } from './backLink'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/BackLink',
  component: BackLink,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof BackLink>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => <BackLink href="/" label="지원자 목록" />,
}

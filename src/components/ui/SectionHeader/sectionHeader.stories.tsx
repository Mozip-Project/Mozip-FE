import { SectionHeader } from './sectionHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof SectionHeader>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Default: Story = {
  render: () => <SectionHeader title="교내 · 연합 공고" moreHref="/" />,
}

export const TitleOnly: Story = {
  render: () => <SectionHeader title="교내 · 연합 공고" />,
}

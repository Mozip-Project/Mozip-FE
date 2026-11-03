import { AttachmentCard, type Attachment } from './attachmentCard'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/AttachmentCard',
  component: AttachmentCard,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof AttachmentCard>

export default meta
type Story = StoryObj

const ITEMS: Attachment[] = [
  { type: 'file', name: '포트폴리오_2026.pdf', meta: 'PDF · 4.2MB', href: '#portfolio' },
  { type: 'link', name: 'behance.net/mozip', meta: '외부 링크', href: '#behance' },
  { type: 'link', name: 'github.com/mozip-ux', meta: '외부 링크', href: '#github' },
  { type: 'file', name: '작업물_모음.zip', meta: 'ZIP · 12.8MB', href: '#works' },
  { type: 'link', name: 'notion.so/mozip-portfolio', meta: '외부 링크', href: '#notion' },
]

export const Attached: Story = {
  render: () => (
    <AttachmentCard
      title="포트폴리오"
      items={ITEMS}
      emptyMessage="첨부한 포트폴리오가 없어요"
      className="w-129 max-w-full"
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <AttachmentCard
      title="포트폴리오"
      items={[]}
      emptyMessage="첨부한 포트폴리오가 없어요"
      className="w-129 max-w-full"
    />
  ),
}

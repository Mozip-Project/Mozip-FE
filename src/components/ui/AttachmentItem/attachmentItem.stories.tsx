import { AttachmentItem } from './attachmentItem'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/AttachmentItem',
  component: AttachmentItem,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof AttachmentItem>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const Types: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-gap-l">
      <AttachmentItem type="file" name="포트폴리오_2026.pdf" meta="PDF · 4.2MB" href="#" />
      <AttachmentItem type="link" name="포트폴리오_2026.pdf" meta="PDF · 4.2MB" href="#" />
      <AttachmentItem
        type="file"
        name="아주_긴_파일_이름이_들어가는_경우의_포트폴리오_최종본.pdf"
        meta="PDF · 12.8MB"
        href="#"
      />
    </div>
  ),
}

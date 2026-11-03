import { INLINE_NOTICE_TONES, InlineNotice, InlineNoticeAction } from './inlineNotice'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/InlineNotice',
  component: InlineNotice,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof InlineNotice>

export default meta
type Story = StoryObj

export const Tones: Story = {
  render: () => (
    <div className="flex w-87.5 max-w-full flex-col gap-4">
      {INLINE_NOTICE_TONES.map((tone) => (
        <InlineNotice
          key={tone}
          tone={tone}
          title="제목"
          action={<InlineNoticeAction>바로가기</InlineNoticeAction>}
        >
          안내 문구를 입력해 주세요
        </InlineNotice>
      ))}
    </div>
  ),
}

export const TextOnly: Story = {
  render: () => (
    <div className="flex w-87.5 max-w-full flex-col gap-4">
      {INLINE_NOTICE_TONES.map((tone) => (
        <InlineNotice key={tone} tone={tone}>
          안내 문구를 입력해 주세요
        </InlineNotice>
      ))}
    </div>
  ),
}

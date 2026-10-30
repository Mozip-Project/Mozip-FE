import { TextArea } from './textArea'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/TextArea',
  component: TextArea,
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-gap-l">
      <TextArea
        aria-label="빈 입력"
        placeholder="내용을 입력해 주세요"
        maxLength={300}
        className="w-90"
      />
      <TextArea
        aria-label="입력됨"
        defaultValue="내용을 입력해 주세요"
        maxLength={300}
        className="w-90"
      />
      <TextArea
        aria-label="읽기 전용"
        defaultValue="내용을 입력해 주세요"
        maxLength={300}
        readOnly
        className="w-90"
      />
    </div>
  ),
}

export const WithoutCounter: Story = {
  render: () => <TextArea aria-label="메모" placeholder="내용을 입력해 주세요" className="w-90" />,
}

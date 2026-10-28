import { SegmentGroup } from './segmentGroup'
import { SEGMENT_SIZES, SEGMENT_TONES, SegmentOption } from './segmentOption'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/SegmentGroup/SegmentOption',
  component: SegmentOption,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof SegmentOption>

export default meta
// 필수 props를 render 안에서 직접 넘겨 args 타입 연결 제외
type Story = StoryObj

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      <SegmentGroup aria-label="옵션">
        <SegmentOption value="a">옵션</SegmentOption>
        <SegmentOption value="b">옵션</SegmentOption>
      </SegmentGroup>
      <SegmentGroup aria-label="옵션" defaultValue="a">
        <SegmentOption value="a">옵션</SegmentOption>
        <SegmentOption value="b">옵션</SegmentOption>
      </SegmentGroup>
      <SegmentGroup aria-label="옵션" aria-invalid>
        <SegmentOption value="a">옵션</SegmentOption>
        <SegmentOption value="b">옵션</SegmentOption>
      </SegmentGroup>
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex gap-gap-l">
      {SEGMENT_TONES.map((tone) => (
        <SegmentGroup key={tone} aria-label="옵션" defaultValue="a">
          <SegmentOption tone={tone} value="a">
            옵션
          </SegmentOption>
        </SegmentGroup>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-gap-l">
      {SEGMENT_SIZES.map((size) => (
        <SegmentGroup key={size} aria-label="옵션">
          <SegmentOption size={size} value="a">
            옵션
          </SegmentOption>
        </SegmentGroup>
      ))}
    </div>
  ),
}

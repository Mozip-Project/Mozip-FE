import { Radio, RadioGroup } from './radio'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Radio',
  component: RadioGroup,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="dev" aria-label="지원 파트">
      <Radio value="dev">개발</Radio>
      <Radio value="design">디자인</Radio>
      <Radio value="plan">기획</Radio>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-gap-l">
      <RadioGroup defaultValue="dev" disabled aria-label="지원 파트">
        <Radio value="dev">개발</Radio>
        <Radio value="design">디자인</Radio>
      </RadioGroup>
      <RadioGroup aria-label="면접 방식">
        <Radio value="offline">대면</Radio>
        <Radio value="online" disabled>
          비대면
        </Radio>
      </RadioGroup>
    </div>
  ),
}

export const WithoutLabel: Story = {
  render: () => (
    <RadioGroup defaultValue="a" aria-label="라디오">
      <Radio value="a" aria-label="선택 A" />
      <Radio value="b" aria-label="선택 B" />
      <Radio value="c" disabled aria-label="선택 C" />
    </RadioGroup>
  ),
}

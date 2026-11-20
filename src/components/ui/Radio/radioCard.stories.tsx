import { RadioGroup } from './radio'
import { RadioCard } from './radioCard'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/RadioCard',
  component: RadioCard,
  parameters: { controls: { disable: true } },
  args: { value: 'design', label: '디자인' },
} satisfies Meta<typeof RadioCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="design" aria-label="지원 포지션" className="w-80 flex-col">
      <RadioCard value="design" label="디자인" description="UI · UX 디자인, 프로토타이핑" />
      <RadioCard value="dev" label="개발" description="프론트엔드 · 백엔드 개발" />
      <RadioCard value="plan" label="기획" description="서비스 기획, 사용자 리서치" disabled />
    </RadioGroup>
  ),
}

export const WithoutDescription: Story = {
  render: () => (
    <RadioGroup aria-label="지원 포지션" className="w-80 flex-col">
      <RadioCard value="design" label="디자인" />
      <RadioCard value="dev" label="개발" />
      <RadioCard value="plan" label="기획" disabled />
    </RadioGroup>
  ),
}

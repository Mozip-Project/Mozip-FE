import { Checkbox } from './checkbox'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-gap-l">
      <Checkbox defaultChecked>체크박스</Checkbox>
      <Checkbox>체크박스</Checkbox>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-gap-l">
      <Checkbox defaultChecked disabled>
        체크박스
      </Checkbox>
      <Checkbox disabled>체크박스</Checkbox>
    </div>
  ),
}

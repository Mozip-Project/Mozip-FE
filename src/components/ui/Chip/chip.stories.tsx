import CloseIcon from '@/assets/icons/close.svg'
import { Chip } from './chip'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Chip',
  component: Chip,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Chip>칩</Chip>,
}

export const Selected: Story = {
  render: () => <Chip defaultPressed>칩</Chip>,
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-gap-m">
      <Chip>
        칩
        <CloseIcon aria-hidden />
      </Chip>
      <Chip defaultPressed>
        칩
        <CloseIcon aria-hidden />
      </Chip>
    </div>
  ),
}

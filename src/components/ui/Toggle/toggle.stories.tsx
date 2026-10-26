import { Toggle } from './toggle'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-gap-l">
      <Toggle defaultChecked aria-label="토글" />
      <Toggle aria-label="토글" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-gap-l">
      <Toggle defaultChecked disabled aria-label="토글" />
      <Toggle disabled aria-label="토글" />
    </div>
  ),
}
